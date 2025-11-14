
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArticleView } from './components/article-view';
import { ForumView } from './components/forum-view';
// La vue de soin mental est retirée car elle dépend de l'API
// import { MentalCareView } from './components/mental-care-view';

export default function WellnessPage() {
    const [activeTab, setActiveTab] = useState("articles");
  
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Centre de Soins Holistiques</h1>
          <p className="mt-2 text-lg text-muted-foreground font-body">Nourrissez votre esprit, votre corps et votre âme.</p>
        </header>

        <Tabs defaultValue="articles" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center">
                <TabsList>
                    <TabsTrigger value="articles">Articles</TabsTrigger>
                    <TabsTrigger value="forum">Forum</TabsTrigger>
                    {/* L'onglet Soutien Moral est retiré car il dépend de l'API */}
                    {/* <TabsTrigger value="mental-care">Soutien Moral</TabsTrigger> */}
                </TabsList>
            </div>
            <TabsContent value="articles" className="mt-6">
                <ArticleView />
            </TabsContent>
            <TabsContent value="forum" className="mt-6">
                <ForumView />
            </TabsContent>
            {/* Le contenu de Soutien Moral est retiré */}
            {/*
            <TabsContent value="mental-care" className="mt-6">
                <MentalCareView />
            </TabsContent>
            */}
        </Tabs>
      </div>
    );
}
