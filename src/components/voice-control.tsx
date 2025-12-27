"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, Zap, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { handleVoiceCommand } from "@/lib/actions";
import { cn } from "@/lib/utils";

type Status = "idle" | "listening" | "processing" | "unsupported" | "denied";

export function VoiceControl() {
  const [status, setStatus] = useState<Status>("idle");
  const router = useRouter();
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("unsupported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setStatus("listening");
    recognition.onend = () => {
        if(status !== 'processing') setStatus("idle");
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setStatus("denied");
        toast({
          variant: "destructive",
          title: "Accès au micro refusé",
          description: "Veuillez autoriser l'accès au microphone dans les paramètres de votre navigateur.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de reconnaissance",
          description: "Une erreur s'est produite. Veuillez réessayer.",
        });
      }
      setStatus("idle");
    };

    recognition.onresult = async (event) => {
      const command = event.results[0][0].transcript;
      setStatus("processing");
      toast({ title: "Commande reçue", description: `"${command}"` });

      const result = await handleVoiceCommand(command);

      if (result?.path) {
        router.push(result.path);
        toast({
          title: "Navigation...",
          description: `Redirection vers la page ${result.path.substring(1)}.`,
        });
      } else if (result?.error) {
        toast({
          variant: "destructive",
          title: "Commande non comprise",
          description: result.error,
        });
      }
      setStatus("idle");
    };

    return () => {
      recognition.stop();
    };
  }, [router, toast, status]);

  const handleClick = () => {
    if (status === "listening") {
      recognitionRef.current?.stop();
      return;
    }
    
    if (status === "unsupported") {
      toast({
        variant: "destructive",
        title: "Navigateur non compatible",
        description: "La commande vocale n'est pas supportée par votre navigateur.",
      });
      return;
    }
    
    recognitionRef.current?.start();
  };

  const getButtonContent = () => {
    switch (status) {
      case "listening":
        return <><Mic className="w-5 h-5 animate-pulse text-red-500" /> Écoute en cours...</>;
      case "processing":
        return <><Loader className="w-5 h-5 animate-spin" /> Traitement...</>;
      case "denied":
      case "unsupported":
        return <><Mic className="w-5 h-5" /> Commande vocale</>;
      default:
        return <><Mic className="w-5 h-5" /> Commande vocale</>;
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      size="lg" 
      disabled={status === 'processing' || status === 'unsupported'}
      className={cn("gap-2 transition-all", status === 'listening' && 'bg-accent text-accent-foreground')}
    >
      {getButtonContent()}
    </Button>
  );
}
