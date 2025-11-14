
'use client';

import { Sparkles, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SymptomCheckerPage() {
    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <Card className="w-full max-w-3xl">
                <CardHeader className="text-center border-b">
                    <h1 className="text-2xl font-bold font-headline tracking-tight text-primary flex items-center justify-center gap-2">
                        <Sparkles />
                        Vérificateur de Symptômes IA
                    </h1>
                    <p className="mt-2 text-muted-foreground font-body text-sm">
                        Décrivez vos symptômes et notre assistant IA vous guidera.
                    </p>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                     <Alert variant="default" className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800 dark:text-yellow-300">En cours de construction</AlertTitle>
                        <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                           Cette fonctionnalité de chat avec l'IA est en cours de développement et sera bientôt disponible.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}
