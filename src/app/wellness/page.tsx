import { wellnessArticles } from "@/lib/data";
import { ArticleCard } from "./components/article-card";

export default function WellnessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Centre de Bien-être Holistique</h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">Nourrissez votre esprit, votre corps et votre âme.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {wellnessArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
