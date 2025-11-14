
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Send, Sparkles, User as UserIcon, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { suggestNextSteps, SymptomCheckerHistory, SymptomCheckerOutput } from '@/ai/flows/symptom-checker-flow';
import type { User } from '@/types';
import Link from 'next/link';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function SymptomCheckerPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaViewport = useRef<HTMLDivElement>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userProfileRef);

  const isPremiumOrAdmin = userProfile?.role === 'Premium' || userProfile?.role === 'Admin';
  
  // Set initial message
  useEffect(() => {
    setMessages([{
      role: 'model',
      content: 'Bonjour ! Décrivez-moi vos symptômes et je pourrai vous suggérer les prochaines étapes. Par exemple : "J\'ai mal à la tête et de la fièvre depuis hier."'
    }]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaViewport.current) {
      scrollAreaViewport.current.scrollTop = scrollAreaViewport.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history: SymptomCheckerHistory = {
        history: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
      };
      const result: SymptomCheckerOutput = await suggestNextSteps(history);
      const modelResponse: Message = { role: 'model', content: result.analysis };
      setMessages(prev => [...prev, modelResponse]);
    } catch (error) {
      console.error("Symptom checker error:", error);
      const errorMessage = "Désolé, une erreur est survenue. Veuillez réessayer plus tard.";
      setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
      toast({
        variant: 'destructive',
        title: 'Erreur de l\'IA',
        description: 'Impossible de contacter l\'assistant pour le moment.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
     return <div className="container mx-auto px-4 py-8 flex justify-center"><Loader2 className="animate-spin" /></div>
  }

  if (!user) {
    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle>Connexion requise</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Accès non autorisé</AlertTitle>
                        <AlertDescription>
                            Vous devez être connecté pour utiliser le vérificateur de symptômes.
                            <Button asChild variant="link" className="px-1">
                                <Link href="/auth/login?redirect=/symptom-checker">Se connecter</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!isPremiumOrAdmin) {
    return (
         <div className="container mx-auto px-4 py-8 flex justify-center">
            <Card className="w-full max-w-3xl">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>Vérificateur de Symptômes IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="default" className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                        <Sparkles className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800 dark:text-yellow-300">Fonctionnalité Premium</AlertTitle>
                        <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                            Le vérificateur de symptômes IA est une fonctionnalité exclusive pour nos membres Premium. Passez à un abonnement supérieur pour y accéder.
                            <Button asChild variant="link" className="px-1">
                                <Link href="/#pricing">Voir les plans</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-3xl flex flex-col h-[calc(100vh-10rem)]">
        <CardHeader className="text-center border-b">
          <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
            <Sparkles className="text-primary"/>
            Vérificateur de Symptômes IA
          </CardTitle>
          <CardDescription>
            Décrivez vos symptômes. Notre IA vous orientera (ceci n'est pas un diagnostic).
          </CardDescription>
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
              placeholder="J'ai mal à la gorge et une légère toux..."
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
