
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Loader2, Send, Sparkles, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestNextSteps } from '@/ai/flows/symptom-checker-flow';
import type { ChatHistory } from '@/ai/flows/chatbot-flow';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function SymptomCheckerPage() {
  const { user } = useFirebase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaViewport = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaViewport.current) {
      scrollAreaViewport.current.scrollTop = scrollAreaViewport.current.scrollHeight;
    }
  }, [messages]);
  
  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Annule la lecture précédente
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history: ChatHistory = {
        history: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
      };
      
      const result = await suggestNextSteps(history);
      const modelResponse: Message = { role: 'model', content: result.analysis };
      setMessages(prev => [...prev, modelResponse]);
      speak(result.analysis); // Lecture de la réponse

    } catch (error) {
      console.error("Symptom checker error:", error);
      const errorMessage = "Désolé, une erreur est survenue. Veuillez réessayer plus tard.";
      setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
      speak(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Erreur de l\'IA',
        description: 'Impossible de contacter l\'assistant pour le moment.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    // Add initial greeting from the model
  useEffect(() => {
    const initialMessage = "Bonjour ! Je suis l'assistant IA de SanteConnect. Décrivez-moi vos symptômes en détail, et je vous aiderai à identifier les prochaines étapes. Comment puis-je vous aider aujourd'hui ?";
    setMessages([{
      role: 'model',
      content: initialMessage
    }]);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-3xl flex flex-col h-[80vh]">
        <CardHeader className="text-center border-b">
          <h1 className="text-2xl font-bold font-headline tracking-tight text-primary flex items-center justify-center gap-2">
            <Sparkles />
            Vérificateur de Symptômes IA
          </h1>
          <p className="mt-2 text-muted-foreground font-body text-sm">
            Décrivez vos symptômes et notre assistant IA vous guidera.
          </p>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col">
           <ScrollArea className="flex-1 p-6" viewportRef={scrollAreaViewport}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'model' && (
                    <Avatar className="w-8 h-8 border-2 border-primary/50">
                      <AvatarFallback><Sparkles className="w-4 h-4 text-primary" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`p-3 rounded-lg max-w-md whitespace-pre-wrap ${message.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                     {message.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                       <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 border-2 border-primary/50">
                    <AvatarFallback><Sparkles className="w-4 h-4 text-primary" /></AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                     <Loader2 className="h-5 w-5 animate-spin" />
                     <span>Analyse en cours...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-4">
           <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Décrivez vos symptômes ici... (ex: 'J'ai mal à la tête et de la fièvre depuis 2 jours')"
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
