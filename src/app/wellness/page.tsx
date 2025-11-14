
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArticleView } from './components/article-view';
import { ForumView } from './components/forum-view';
import { MentalCareView } from './components/mental-care-view';

export default function WellnessPage() {
    const [activeTab, setActiveTab] = useState("articles");
    
    // Détecter si la clé API est manquante. On utilise une astuce car les variables d'env ne sont pas
    // toutes dispo côté client. Si GEMINI_API_KEY est là, on ne la préfixe pas avec NEXT_PUBLIC_.
    // Donc on suppose qu'elle est manquante si NEXT_PUBLIC_GEMINI_API_KEY n'est pas définie en prod.
    const isApiKeyMissing = !process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NODE_ENV === 'production';
  
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
                    {/* On affiche l'onglet Soutien Moral seulement si la clé API n'est PAS manquante */}
                    {!isApiKeyMissing && <TabsTrigger value="mental-care">Soutien Moral</TabsTrigger>}
                </TabsList>
            </div>
            <TabsContent value="articles" className="mt-6">
                <ArticleView />
            </TabsContent>
            <TabsContent value="forum" className="mt-6">
                <ForumView />
            </TabsContent>
             {/* Le contenu de Soutien Moral est conditionnel */}
            {!isApiKeyMissing && (
              <TabsContent value="mental-care" className="mt-6">
                  <MentalCareView />
              </TabsContent>
            )}
        </Tabs>
      </div>
    );
}
