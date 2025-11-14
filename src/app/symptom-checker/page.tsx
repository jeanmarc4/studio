
'use client';

import { Wrench } from 'lucide-react';

export default function SymptomCheckerPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Vérificateur de Symptômes IA</h1>
                <p className="mt-2 text-lg text-muted-foreground font-body">
                    Décrivez vos symptômes et notre assistant IA vous guidera vers les prochaines étapes.
                </p>
            </header>
            
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Fonctionnalité en cours de construction</h3>
                <p className="mt-2 text-sm text-muted-foreground">Notre vérificateur de symptômes intelligent sera bientôt disponible. Revenez plus tard !</p>
            </div>
        </div>
    );
}
