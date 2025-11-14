'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, User, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { suggestNextSteps, SymptomCheckerHistory } from '@/ai/flows/symptom-checker-flow';
import { cn } from '@/lib/utils';

type Message = {
    role: 'user' | 'model';
    content: string;
};

export default function SymptomCheckerPage() {
    const { user } = useFirebase();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            content: "Bonjour ! Je suis l'assistant IA de SanteConnect. Décrivez-moi vos symptômes et je pourrai vous orienter. Comment puis-je vous aider aujourd'hui ?",
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);
    
    const handleSendMessage = async () => {
        if (!input.trim()) return;
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Connexion requise',
                description: 'Vous devez être connecté pour utiliser le vérificateur de symptômes.',
            });
            return;
        }

        const newMessages: Message[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const chatHistory: SymptomCheckerHistory = { history: newMessages };
            const result = await suggestNextSteps(chatHistory);
            
            setMessages(prev => [...prev, { role: 'model', content: result.analysis }]);

        } catch (error) {
            console.error('Symptom checker error:', error);
            setMessages(prev => [...prev, { role: 'model', content: "Désolé, une erreur est survenue. Veuillez réessayer plus tard." }]);
            toast({
                variant: 'destructive',
                title: 'Erreur de l\'IA',
                description: 'Impossible de contacter l\'assistant pour le moment.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Card className="w-full max-w-3xl">
                <CardHeader className="text-center">
                    <h1 className="text-2xl font-bold font-headline tracking-tight text-primary flex items-center justify-center gap-2">
                        <Sparkles />
                        Vérificateur de Symptômes IA
                    </h1>
                    <p className="mt-2 text-muted-foreground font-body">
                        Décrivez vos symptômes et notre assistant IA vous guidera.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                     <ScrollArea className="h-[400px] w-full space-y-4 pr-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                            key={index}
                            className={cn(
                                'flex items-start gap-3',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                            >
                            {message.role === 'model' && (
                                <Avatar className="h-8 w-8 border">
                                <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            )}
                             <div
                                className={cn(
                                'max-w-xs md:max-w-md rounded-lg p-3 text-sm whitespace-pre-wrap',
                                message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                )}
                            >
                                {message.content}
                            </div>
                            {message.role === 'user' && (
                                <Avatar className="h-8 w-8 border">
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border">
                                <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg p-3">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4 border-t pt-4">
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Avertissement Important</AlertTitle>
                        <AlertDescription>
                            Cet outil ne remplace pas un avis médical. Consultez toujours un professionnel de santé qualifié pour tout problème de santé.
                        </AlertDescription>
                    </Alert>
                    <div className="flex w-full items-start space-x-4">
                        <Textarea
                            placeholder="Décrivez vos symptômes ici..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading}
                            className="min-h-[60px] flex-1 resize-none"
                        />
                        <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Envoyer</span>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
