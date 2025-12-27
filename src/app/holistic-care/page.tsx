'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Feather, User, Loader2, Sparkles, BrainCircuit, Salad, Moon } from "lucide-react";
import { handleBenevolentChat, handleGenerateWellnessTip } from '@/lib/actions';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

type WellnessTip = {
    title: string;
    content: string;
}

const wellnessTopics = [
    { id: 'nutrition', label: 'Nutrition', icon: Salad },
    { id: 'stress', label: 'Stress', icon: BrainCircuit },
    { id: 'sommeil', label: 'Sommeil', icon: Moon },
]

export default function HolisticCarePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [wellnessTip, setWellnessTip] = useState<WellnessTip | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsChatLoading(true);

    try {
      const result = await handleBenevolentChat(input);
      if (result.response) {
        const assistantMessage: Message = { role: 'assistant', content: result.response };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = { role: 'assistant', content: result.error || "Désolé, je n'ai pas pu répondre. Veuillez réessayer." };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: "Une erreur est survenue. Veuillez réessayer." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleTipGeneration = async (topic: string) => {
    setIsTipLoading(true);
    setSelectedTopic(topic);
    setWellnessTip(null);
    try {
        const result = await handleGenerateWellnessTip(topic);
        if (result.tip) {
            setWellnessTip(result.tip);
        } else {
             setWellnessTip({ title: 'Erreur', content: result.error || "Impossible de générer le conseil." });
        }
    } catch (error) {
        setWellnessTip({ title: 'Erreur', content: "Une erreur est survenue." });
    } finally {
        setIsTipLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-foreground font-headline">
          Soins Holistiques
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Un espace pour votre bien-être mental et physique.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Feather className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle className="text-2xl font-headline">Conseils Bien-être</CardTitle>
                        <CardDescription>Découvrez des astuces pour améliorer votre quotidien.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-grow">
                <div className="flex flex-col sm:flex-row gap-2">
                    {wellnessTopics.map(topic => (
                        <Button
                            key={topic.id}
                            variant="outline"
                            className="w-full justify-center"
                            onClick={() => handleTipGeneration(topic.label)}
                            disabled={isTipLoading}
                        >
                            {isTipLoading && selectedTopic === topic.label ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <topic.icon className="mr-2 h-4 w-4" />
                            )}
                            {topic.label}
                        </Button>
                    ))}
                </div>
                 <ScrollArea className="flex-grow p-4 bg-muted/50 rounded-lg min-h-[250px] h-full">
                    {wellnessTip ? (
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-primary">{wellnessTip.title}</h3>
                            <p className="text-sm whitespace-pre-wrap">{wellnessTip.content}</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                             <p className="text-sm text-muted-foreground italic text-center">Sélectionnez un sujet pour générer un conseil.</p>
                        </div>
                    )}
                 </ScrollArea>
            </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col">
             <CardHeader>
                <div className="flex items-center gap-4">
                    <Bot className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle className="text-2xl font-headline">Chat IA Bienveillant</CardTitle>
                        <CardDescription>Discutez avec notre assistant IA pour un soutien amical.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-grow">
                <ScrollArea className="flex-grow p-4 bg-muted/50 rounded-lg min-h-[250px] h-full">
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                             <p className="text-sm text-muted-foreground italic text-center py-10">Commencez la conversation en posant une question ou en partageant vos pensées.</p>
                        ) : messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'assistant' && <Bot className="w-6 h-6 text-primary flex-shrink-0" />}
                                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                                {message.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
                            </div>
                        ))}
                         {isChatLoading && (
                            <div className="flex items-start gap-3">
                                <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                                <div className="rounded-lg px-4 py-2 bg-secondary">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleChatSubmit} className="flex items-start gap-2">
                    <Textarea 
                        placeholder="Écrivez votre message ici..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleChatSubmit(e);
                            }
                        }}
                        disabled={isChatLoading}
                        className="flex-grow"
                    />
                    <Button type="submit" disabled={isChatLoading || !input.trim()} size="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send-horizontal"><path d="m3 3 3 9-3 9 19-9Z"/><path d="M6 12h16"/></svg>
                        <span className="sr-only">Envoyer</span>
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
