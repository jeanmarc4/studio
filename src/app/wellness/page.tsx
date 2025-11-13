
'use client';

import { useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { HolisticContent } from '@/docs/backend-documentation';
import { ArticleCard } from "./components/article-card";
import { Skeleton } from '@/components/ui/skeleton';
import { Leaf } from 'lucide-react';
import { wellnessArticles as staticArticles } from '@/lib/data'; // Keep for images for now

// We need to enrich the content with static images for the demo
type EnrichedHolisticContent = HolisticContent & {
    image?: string;
    imageHint?: string;
    excerpt?: string;
    readTime?: string;
    category?: string;
};

export default function WellnessPage() {
  const { firestore } = useFirebase();

  const contentQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'holisticContent');
  }, [firestore]);

  const { data: articles, isLoading } = useCollection<HolisticContent>(contentQuery);

  const enrichedArticles: EnrichedHolisticContent[] = useMemo(() => {
    if (!articles) return [];
    // This is a temporary solution to match static images with firestore data
    // In a real app, image URLs would be stored in Firestore.
    return articles.map((article, index) => {
        const staticArticle = staticArticles[index % staticArticles.length];
        return {
            ...article,
            image: staticArticle?.image,
            imageHint: staticArticle?.imageHint,
            excerpt: article.description || staticArticle?.excerpt,
            readTime: staticArticle?.readTime || '5 min de lecture',
            category: article.type || staticArticle?.category,
        }
    })
  }, [articles]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Centre de Bien-être Holistique</h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">Nourrissez votre esprit, votre corps et votre âme.</p>
      </header>

      {isLoading ? (
         <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
         </div>
      ) : enrichedArticles && enrichedArticles.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {enrichedArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
            ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Leaf className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">Aucun article de bien-être pour le moment</h3>
            <p className="mt-2 text-sm text-muted-foreground">Revenez bientôt pour des conseils et des guides.</p>
        </div>
      )}
    </div>
  );
}
