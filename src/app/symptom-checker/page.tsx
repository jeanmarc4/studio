
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Sparkles, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SymptomCheckerPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center border-b pb-6">
          <h1 className="text-2xl font-bold font-headline tracking-tight text-primary flex items-center justify-center gap-2">
            <Sparkles />
            Vérificateur de Symptômes IA
          </h1>
          <p className="mt-2 text-muted-foreground font-body text-sm">
            Décrivez vos symptômes et notre assistant IA vous guidera.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Fonctionnalité Indisponible</AlertTitle>
                <AlertDescription>
                    Le vérificateur de symptômes par IA n'est pas disponible car la clé d'API pour le service d'intelligence artificielle n'a pas été configurée.
                    <p className="mt-2">
                        Si vous êtes le développeur, veuillez ajouter votre `GEMINI_API_KEY` au fichier `.env` à la racine du projet pour activer cette fonctionnalité.
                    </p>
                </AlertDescription>
            </Alert>
            <div className="text-center mt-6">
                 <Button asChild>
                    <Link href="/">Retour au Tableau de Bord</Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
