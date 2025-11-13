
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ArrowUp, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { mentalCareChat } from '@/ai/flows/chatbot-flow';

type Message = {
    role: 'user' | 'model';
    text: string;
};

export function MentalCareView() {
    const { user, isUserLoading } = useFirebase();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    
    // Redirect if user not logged in
    useEffect(() => {
        if (!isUserLoading && !user) {
        router.push('/auth/login?redirect=/wellness');
        }
    }, [isUserLoading, user, router]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if(user && messages.length === 0) {
            setMessages([
                { role: 'model', text: 'Bonjour ! Comment vous sentez-vous aujourd\'hui ? N\'hésitez pas à partager ce qui vous préoccupe. Je suis là pour vous écouter sans jugement.'}
            ])
        }
    }, [user, messages.length])

    const handleSendMessage = async () => {
        if (!input.trim() || !user) return;

        const userMessage: Message = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        const historyForApi = newMessages.map(msg => ({
            role: msg.role,
            content: msg.text,
        }));

        try {
            const result = await mentalCareChat(historyForApi);
            const modelMessage: Message = { role: 'model', text: result.response };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Erreur de l'IA:", error);
            const errorMessage: Message = { role: 'model', text: "Désolé, une erreur est survenue. Veuillez réessayer." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!user) {
        return (
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Accès Restreint</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Vous devez être connecté pour accéder au chatbot de soutien moral.</p>
                     <Button asChild className="mt-4">
                        <a href="/auth/login?redirect=/wellness">Se connecter</a>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                 <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="text-primary"/>
                    Soutien Moral IA
                </CardTitle>
                <CardDescription>
                    Un espace sécurisé pour discuter de vos émotions et de votre bien-être mental.
                </CardDescription>
                <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                    <Bot className="h-4 w-4 !text-blue-600" />
                    <AlertTitle>Ceci est un assistant IA</AlertTitle>
                    <AlertDescription>
                        Cet outil est là pour offrir un soutien émotionnel, mais il ne remplace pas un professionnel de la santé mentale.
                    </AlertDescription>
                </Alert>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] flex flex-col">
                    <div className="flex-grow overflow-y-auto pr-4 space-y-6">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'model' && (
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Bot className="h-6 w-6 text-primary" />
                                    </div>
                                )}
                                <div className={`max-w-lg p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                </div>
                                {message.role === 'user' && (
                                    <div className="p-2 bg-muted rounded-full">
                                        <User className="h-6 w-6" />
                                    </div>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-4">
                                 <div className="p-2 bg-primary/10 rounded-full">
                                    <Bot className="h-6 w-6 text-primary" />
                                </div>
                                <div className="max-w-lg p-3 rounded-lg bg-muted flex items-center">
                                    <Loader2 className="h-5 w-5 animate-spin"/>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t pt-4">
                        <Textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Exprimez-vous librement ici..."
                            className="flex-grow resize-none"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            disabled={isLoading}
                        />
                        <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="icon" className="h-full w-12">
                            <ArrowUp className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
