
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, User, Loader2, Heart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { mentalCareChat, ChatHistory } from '@/ai/flows/chatbot-flow';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';

type Message = {
    role: 'user' | 'model';
    content: string;
};

export function MentalCareView() {
    const { user, isUserLoading } = useFirebase();
    const { activeProfile } = useProfile();
    const isPremiumOrAdmin = activeProfile?.relationship === 'self' && (activeProfile?.role === 'Premium' || activeProfile?.role === 'Admin');

    const { toast } = useToast();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            content: "Bonjour, je suis SanteConnect Moral. Je suis là pour vous écouter en toute bienveillance. Comment vous sentez-vous aujourd'hui ?",
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaViewportRef.current) {
            scrollAreaViewportRef.current.scrollTo({ top: scrollAreaViewportRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);
    
     useEffect(() => {
        if (!isUserLoading && !user) {
            toast({
                variant: 'destructive',
                title: 'Connexion requise',
                description: 'Vous devez être connecté pour utiliser cette fonctionnalité.',
            });
            router.push('/auth/login?redirect=/wellness');
        }
    }, [user, isUserLoading, router, toast]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || !user) return;
        
        if (!isPremiumOrAdmin) {
             toast({
                variant: 'destructive',
                title: 'Fonctionnalité Premium',
                description: 'Le soutien moral IA est réservé aux membres Premium.',
            });
            return;
        }


        const newMessages: Message[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const chatHistory: ChatHistory = { history: newMessages };
            const result = await mentalCareChat(chatHistory);
            
            setMessages(prev => [...prev, { role: 'model', content: result.response }]);

        } catch (error) {
            console.error('Mental care chat error:', error);
            setMessages(prev => [...prev, { role: 'model', content: "Désolé, une erreur est survenue. Veuillez réessayer plus tard." }]);
            toast({
                variant: 'destructive',
                title: 'Erreur de l\'IA',
                description: 'Impossible de contacter l\'assistant pour le moment.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [input, user, messages, toast, isPremiumOrAdmin]);
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

     if (isUserLoading || !user) {
        return (
             <div className="flex items-center justify-center h-96">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        )
    }

    return (
        <Card className="w-full max-w-3xl mx-auto flex flex-col h-[85vh]">
            <CardHeader className="text-center border-b">
                <CardTitle className="flex items-center gap-2 font-headline justify-center">
                    <Heart className="text-primary"/>
                    Soutien Moral IA
                </CardTitle>
                <CardDescription>
                    Un espace sécurisé pour discuter de vos émotions et de votre bien-être.
                </CardDescription>
            </CardHeader>
             <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
                    <div className="space-y-4 p-4">
                    {messages.map((message, index) => (
                        <div
                        key={index}
                        className={cn(
                            'flex items-end gap-3',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        >
                        {message.role === 'model' && (
                            <Avatar className="h-8 w-8 border">
                            <AvatarFallback><Heart className="h-4 w-4" /></AvatarFallback>
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
                        <div className="flex items-end gap-3">
                            <Avatar className="h-8 w-8 border">
                            <AvatarFallback><Heart className="h-4 w-4" /></AvatarFallback>
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
                <div className="flex w-full items-start space-x-4">
                    <Textarea
                        placeholder="Exprimez-vous ici..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={isLoading || !isPremiumOrAdmin}
                        className="min-h-[60px] flex-1 resize-none"
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !input.trim() || !isPremiumOrAdmin}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Envoyer</span>
                    </Button>
                </div>
                {!isPremiumOrAdmin && (
                    <p className="text-xs text-muted-foreground text-center w-full">Cette fonctionnalité est réservée aux membres Premium.</p>
                )}
            </CardFooter>
        </Card>
    );
}
