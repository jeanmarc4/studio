
'use client';

import Link from "next/link";
import { CheckCircle2, UserCheck, BotIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const gratuitFeatures = [
    "Gestion des rendez-vous",
    "Suivi du traitement par confirmation manuelle",
    "Pas de rappels automatiques",
    "Accès au forum communautaire"
];

const standardFeatures = [
    "Toutes les fonctionnalités du plan Gratuit",
    "Rappels par notification push (médicaments & RDV)",
    "Vérificateur de symptômes (2 fois/semaine)",
    "Support standard"
];

const premiumFeatures = [
    "Toutes les fonctionnalités Standard",
    "Vérificateur de symptômes illimité",
    "Analyse d'ordonnances par l'IA",
    "Rappels vocaux intelligents par l'IA",
    "Support prioritaire"
];

const howItWorksSteps = [
    {
        icon: UserCheck,
        title: "1. Organisez votre santé",
        description: "Regroupez vos rendez-vous, vos ordonnances et vos médicaments en un seul endroit. Fini les oublis et les papiers perdus."
    },
    {
        icon: BotIcon,
        title: "2. Obtenez des conseils instantanés",
        description: "Utilisez notre assistant IA pour analyser vos symptômes ou extraire les informations de vos ordonnances. Une aide précieuse à portée de main."
    },
    {
        icon: MessageSquare,
        title: "3. Échangez avec la communauté",
        description: "Rejoignez notre forum pour discuter avec d'autres utilisateurs, partager des expériences et trouver du soutien dans votre parcours de santé."
    }
];


export function GuestHomepage() {
  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-primary/5 py-12 md:py-20 lg:py-28 relative">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-headline text-primary">
            Votre Santé, Connectée.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl font-body">
            SanteConnect est votre partenaire de confiance pour gérer les rendez-vous, vérifier les symptômes et adopter un mode de vie holistique.
          </p>
          <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/auth/signup">Créer un compte</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#pricing">Voir les plans</Link>
              </Button>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="container w-full max-w-6xl py-12 md:py-16">
         <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Comment SanteConnect vous accompagne</h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Simplifiez la gestion de votre santé en 3 étapes claires.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {howItWorksSteps.map(step => (
                 <div key={step.title} className="text-center flex flex-col items-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                        <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-headline font-semibold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                 </div>
            ))}
          </div>
      </section>
      
      {/* Pricing/Subscription Section */}
      <section id="pricing" className="w-full bg-muted/40 py-12 md:py-20">
        <div className="container w-full max-w-6xl">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Choisissez le plan qui vous convient</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Commencez gratuitement ou débloquez plus de fonctionnalités avec nos plans payants.
                </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Free Plan */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Gratuit</CardTitle>
                    <CardDescription>L'essentiel pour commencer à s'organiser.</CardDescription>
                    <p className="text-4xl font-bold pt-2">0 €</p>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    <p className="font-semibold">Fonctionnalités incluses :</p>
                    <ul className="space-y-2">
                       {gratuitFeatures.map(feat => (
                        <li key={feat} className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-accent" />
                            <span>{feat}</span>
                        </li>
                       ))}
                    </ul>
                </CardContent>
                <CardContent>
                    <Button asChild className="w-full" variant="outline">
                        <Link href="/auth/signup">Commencer</Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Standard Plan */}
            <Card className="flex flex-col h-full border-2 border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold py-1 px-3 rounded-bl-lg">RECOMMANDÉ</div>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Standard</CardTitle>
                    <CardDescription>Pour une tranquillité d'esprit avec des rappels automatisés.</CardDescription>
                    <p className="text-4xl font-bold pt-2">9,99 € <span className="text-lg font-normal text-muted-foreground">/ mois</span></p>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    <p className="font-semibold">Fonctionnalités incluses :</p>
                    <ul className="space-y-2">
                       {standardFeatures.map(feat => (
                        <li key={feat} className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <span>{feat}</span>
                        </li>
                       ))}
                    </ul>
                </CardContent>
                <CardContent>
                     <Button asChild className="w-full">
                       <a href="https://www.paypal.com/donate/?hosted_button_id=NGF6CAZ43Z2G8" target="_blank" rel="noopener noreferrer">S'abonner via PayPal</a>
                    </Button>
                </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Premium</CardTitle>
                    <CardDescription>L'assistance de l'IA pour une santé proactive.</CardDescription>
                    <p className="text-4xl font-bold pt-2">19,99 € <span className="text-lg font-normal text-muted-foreground">/ mois</span></p>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    <p className="font-semibold">Fonctionnalités incluses :</p>
                    <ul className="space-y-2">
                       {premiumFeatures.map(feat => (
                        <li key={feat} className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-accent" />
                            <span>{feat}</span>
                        </li>
                       ))}
                    </ul>
                </CardContent>
                <CardContent>
                    <Button asChild className="w-full" variant="outline">
                       <a href="https://www.paypal.com/donate/?hosted_button_id=NGF6CAZ43Z2G8" target="_blank" rel="noopener noreferrer">S'abonner via PayPal</a>
                    </Button>
                </CardContent>
            </Card>
            </div>
        </div>
      </section>
    </main>
  );
}

    
