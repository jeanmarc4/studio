'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore, useUser } from "@/firebase";
import type { User } from "@/lib/types";
import { doc } from "firebase/firestore";
import { useMemo } from "react";
import { createCheckoutSession } from "@/lib/actions";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    features: [
      "Jusqu'à 5 médicaments",
      "Jusqu'à 2 médecins",
      "Suivi des tâches quotidiennes",
      "Rappels de base",
    ],
    cta: "Passer à Gratuit",
  },
  {
    name: "Standard",
    price: "4.99€/mois",
    features: [
      "Jusqu'à 10 médicaments",
      "Jusqu'à 5 médecins",
      "Mémos vocaux pour les rappels",
      "Accès au Chat IA bienveillant",
    ],
    cta: "Passer à Standard",
  },
  {
    name: "Premium",
    price: "9.99€/mois",
    features: [
      "Médicaments illimités",
      "Médecins illimités",
      "Toutes les fonctionnalités Standard",
      "Suivi de pathologies spécifiques (add-on)",
    ],
    cta: "Passer à Premium",
  },
];

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemo(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userData, isLoading: isUserDataLoading } = useDoc<User>(userDocRef);

    const currentPlan = userData?.subscriptionPlan || 'Gratuit';
    const isLoading = isUserLoading || isUserDataLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-foreground font-headline">
          Paramètres
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Gérez votre compte et votre abonnement.
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestion du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Email : {user?.email}
          </p>
           <p className="text-muted-foreground mt-2">
            Les réglages du profil et les préférences de notification seront accessibles ici.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>Vous êtes actuellement sur le plan <span className="font-bold text-primary">{currentPlan}</span>. Choisissez un autre plan si vous le souhaitez.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={cn("flex flex-col", plan.name === currentPlan && "border-primary ring-2 ring-primary")}>
                <form action={createCheckoutSession}>
                    <input type="hidden" name="plan" value={plan.name} />
                    <input type="hidden" name="userId" value={user?.uid} />
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                        <p className="text-3xl font-bold">{plan.price}</p>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                        <ul className="space-y-2">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            type="submit"
                            className="w-full" 
                            disabled={plan.name === currentPlan || !user || plan.name === 'Gratuit'} // Disable for current plan, if not logged in, or for the free plan
                            variant={plan.name === currentPlan ? 'outline' : 'default'}
                        >
                            {plan.name === currentPlan ? 'Plan Actuel' : plan.cta}
                        </Button>
                    </CardFooter>
              </form>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
