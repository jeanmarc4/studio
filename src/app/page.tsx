'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AppFooter } from "@/components/layout/footer";

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
    cta: "Commencer gratuitement",
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
    cta: "Choisir Standard",
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
    cta: "Choisir Premium",
  },
];

export default function LandingPage() {

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col items-center justify-center flex-1 bg-background p-4 md:p-8">
          <header className="text-center mb-12">
              <h1 className="text-5xl font-bold text-foreground font-headline tracking-tighter">
              Santé Zen
              </h1>
              <p className="text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
              Votre assistant santé personnel pour une gestion simple et sereine de votre bien-être au quotidien.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                  <Button size="lg" asChild>
                      <Link href="/login">Commencer</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                      <Link href="/login">Se connecter</Link>
                  </Button>
              </div>
          </header>
        
        <main className="w-full max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={cn("flex flex-col transition-all hover:scale-105", plan.name === 'Premium' && "border-primary ring-2 ring-primary")}>
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
                  <Button asChild className="w-full" variant={plan.name === 'Premium' ? 'default' : 'outline'}>
                      <Link href={`/login?plan=${plan.name}`}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
      <AppFooter />
    </div>
  );
}
