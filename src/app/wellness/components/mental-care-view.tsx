
'use client';

import { Wrench, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function MentalCareView() {
    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                 <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="text-primary"/>
                    Soutien Moral IA
                </CardTitle>
                <CardDescription>
                    Un espace sécurisé pour discuter de vos émotions et de votre bien-être mental.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Fonctionnalité en cours de construction</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Notre chatbot de soutien moral sera bientôt disponible. Revenez plus tard !</p>
                </div>
            </CardContent>
        </Card>
    );
}
