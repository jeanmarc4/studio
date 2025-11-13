
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Star } from 'lucide-react';
import type { MedicalProfessional } from '@/docs/backend-documentation';

type EnrichedProfessional = MedicalProfessional & {
  image?: string;
  imageHint?: string;
  rating?: number;
  reviews?: number;
};

interface ProfessionalCardProps {
  professional: EnrichedProfessional;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      {professional.image && (
        <div className="relative h-48 w-full">
          <Image
            src={professional.image}
            alt={`Photo de ${professional.name}`}
            fill
            className="object-cover"
            data-ai-hint={professional.imageHint}
          />
           {professional.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-bold text-foreground backdrop-blur-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
              <span>{professional.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline text-lg">{professional.name}</CardTitle>
        <p className="text-sm text-primary">{professional.specialty}</p>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
          <span>{professional.address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span>{professional.phone}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled>
          Prendre RDV
        </Button>
      </CardFooter>
    </Card>
  );
}
