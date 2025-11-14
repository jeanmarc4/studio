
'use client';

import { Heart, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


export function MentalCareView() {

    return (
        <Card className="w-full max-w-3xl mx-auto flex flex-col min-h-[50vh]">
            <CardHeader className="text-center border-b">
                <CardTitle className="flex items-center gap-2 font-headline justify-center">
                    <Heart className="text-primary"/>
                    Soutien Moral IA
                </CardTitle>
                <CardDescription>
                    Un espace sécurisé pour discuter de vos émotions et de votre bien-être.
                </CardDescription>
            </CardHeader>
             <CardContent className="flex-1 p-6 flex items-center justify-center">
                <Alert variant="default" className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800 dark:text-yellow-300">En cours de construction</AlertTitle>
                    <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                        Le chatbot de soutien moral est en cours de développement et sera disponible prochainement pour les membres Premium.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
