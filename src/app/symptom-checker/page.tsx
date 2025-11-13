
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ArrowUp, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { suggestNextSteps } from '@/ai/flows/symptom-checker-flow';

type Message = {
    role: 'user' | 'model';
    text: string;
};

export default function SymptomCheckerPage() {
    const { user, isUserLoading } = useFirebase();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    
    // Redirect if user not logged in
    useEffect(() => {
        if (!isUserLoading && !user) {
        router.push('/auth/login?redirect=/symptom-checker');
        }
    }, [isUserLoading, user, router]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

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
            const result = await suggestNextSteps(historyForApi);
            const modelMessage: Message = { role: 'model', text: result.analysis };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Erreur de l'IA:", error);
            const errorMessage: Message = { role: 'model', text: "Désolé, une erreur est survenue. Veuillez réessayer." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Vérificateur de Symptômes IA</h1>
                <p className="mt-2 text-lg text-muted-foreground font-body">
                    Décrivez vos symptômes et notre assistant IA vous guidera vers les prochaines étapes.
                </p>
            </header>
            
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <Alert variant="destructive">
                        <Bot className="h-4 w-4" />
                        <AlertTitle>Avertissement Important</AlertTitle>
                        <AlertDescription>
                            Cet outil ne remplace pas un avis médical professionnel. Consultez toujours un médecin pour tout problème de santé.
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
                                placeholder="Décrivez vos symptômes ici... (ex: 'J'ai mal à la tête et une légère fièvre depuis deux jours.')"
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
        </div>
    );
}
