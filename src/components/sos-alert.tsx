"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export function SosAlert() {
    const { toast } = useToast();

    const handleSosClick = () => {
        toast({
            title: "Alerte SOS envoyée",
            description: "Vos contacts d'urgence ont été informés.",
            variant: "destructive",
        })
    }

    return (
        <Alert className="bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-center p-8">
            <AlertTitle className="text-2xl font-bold text-red-800 dark:text-red-200 flex items-center justify-center gap-2">
              <ShieldAlert className="h-8 w-8" />
              Urgence SOS
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300 mt-2 text-base">
              Dans une situation critique ? Appuyez sur le bouton ci-dessous pour envoyer une alerte immédiate à vos contacts d'urgence.
            </AlertDescription>
            <Button 
                size="lg" 
                variant="destructive" 
                className="mt-6 text-lg font-bold py-6 px-10"
                onClick={handleSosClick}
            >
              ENVOYER L'ALERTE MAINTENANT
            </Button>
        </Alert>
    );
}
