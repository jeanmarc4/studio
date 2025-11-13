
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HolisticContent } from "@/docs/backend-documentation";

// Enriched type for display purposes
type EnrichedHolisticContent = HolisticContent & {
    image?: string;
    imageHint?: string;
    excerpt?: string;
    readTime?: string;
    category?: string;
};

interface ArticleCardProps {
  article: EnrichedHolisticContent;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-xl">
      {article.image && (
        <div className="relative h-48 w-full">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            data-ai-hint={article.imageHint}
          />
        </div>
      )}
      <CardHeader>
        <Badge variant="outline" className="w-fit mb-2">{article.category}</Badge>
        <CardTitle className="font-headline text-xl leading-tight">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground font-body">{article.excerpt}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{article.readTime}</span>
        <Button asChild variant="link" className="text-accent p-0">
            <a href={article.url} target="_blank" rel="noopener noreferrer">Lire la suite</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
