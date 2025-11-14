
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Send, Heart, User as UserIcon, AlertTriangle, Sparkles } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { mentalCareChat } from '@/ai/flows/chatbot-flow';
import type { User } from '@/types';
import type { ChatHistory } from '@/ai/flows/chatbot-flow';
import Link from 'next/link';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function MentalCareView() {
  const { user, firestore } = useFirebase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaViewport = useRef<HTMLDivElement>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<User>(userProfileRef);
  const isPremiumOrAdmin = userProfile?.role === 'Premium' || userProfile?.role === 'Admin';


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
        const result = await mentalCareChat(history);
        const modelResponse: Message = { role: 'model', content: result.response };
        setMessages(prev => [...prev, modelResponse]);
        speak(result.response);
    } catch (error) {
        console.error("Mental care chat error:", error);
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
  
  useEffect(() => {
    setMessages([{
      role: 'model',
      content: "Bonjour, je suis SanteConnect Moral, votre chatbot de soutien. Comment vous sentez-vous aujourd'hui ?"
    }]);
  }, []);

  if (!user) {
    return (
        <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connexion requise</AlertTitle>
            <AlertDescription>
                Vous devez être connecté pour utiliser le chatbot de soutien.
                <Button asChild variant="link">
                    <Link href="/auth/login?redirect=/wellness">Se connecter</Link>
                </Button>
            </AlertDescription>
        </Alert>
    )
  }

  if (!isPremiumOrAdmin) {
     return (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 max-w-3xl mx-auto">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-300">Fonctionnalité Premium</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                Le chatbot de soutien moral est une fonctionnalité exclusive pour nos membres Premium. Passez à un abonnement supérieur pour accéder à un soutien confidentiel et bienveillant.
                <Button asChild variant="link">
                    <Link href="/#pricing">Voir les plans</Link>
                </Button>
            </AlertDescription>
        </Alert>
     )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto flex flex-col h-[80vh]">
      <CardHeader className="text-center border-b">
        <CardTitle className="flex items-center gap-2 font-headline justify-center">
          <Heart className="text-primary"/>
          Soutien Moral IA
        </CardTitle>
        <CardDescription>
          Un espace sécurisé pour discuter de vos émotions et de votre bien-être.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-6" viewportRef={scrollAreaViewport}>
           <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'model' && (
                    <Avatar className="w-8 h-8 border-2 border-primary/50">
                      <AvatarFallback><Heart className="w-4 h-4 text-primary" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`p-3 rounded-lg max-w-md whitespace-pre-wrap ${message.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                    {message.content}
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
                    <AvatarFallback><Heart className="w-4 h-4 text-primary" /></AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                     <Loader2 className="h-5 w-5 animate-spin" />
                     <span>Écrit...</span>
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
              placeholder="Exprimez-vous ici..."
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
  );
}
