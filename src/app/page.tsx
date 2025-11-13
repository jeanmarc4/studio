'use client';

import { Stethoscope, Sparkles, Leaf, ArrowRight, Pill, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { useFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Skeleton } from "@/components/ui/skeleton";

const featureCards = [
   {
    icon: Calendar,
    title: "Mes Rendez-vous",
    description: "Consultez, planifiez et gérez tous vos rendez-vous médicaux en un seul endroit.",
    href: "/my-appointments",
    bgColor: "bg-red-100 dark:bg-red-900/50",
    iconColor: "text-red-500",
  },
  {
    icon: FileText,
    title: "Gestion d'Ordonnances",
    description: "Ajoutez vos ordonnances et laissez l'IA extraire les informations pour un suivi facile.",
    href: "/prescriptions",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
    iconColor: "text-yellow-500",
  },
  {
    icon: Pill,
    title: "Suivi de Traitement",
    description: "Organisez votre plan de médication, recevez des rappels et ne manquez plus jamais une prise.",
    href: "/medications",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-500",
  },
   {
    icon: Sparkles,
    title: "Vérificateur de Symptômes IA",
    description: "Décrivez vos symptômes à notre assistant IA pour obtenir des conseils et une orientation.",
    href: "/symptom-checker",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-500",
  },
  {
    icon: Leaf,
    title: "Soins Holistiques & Forum",
    description: "Explorez des articles sur le bien-être et échangez avec la communauté sur notre forum.",
    href: "/wellness",
    bgColor: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-500",
  },
];

export default function Home() {
  const { user, isUserLoading } = useFirebase();

  const renderLoadingState = () => (
    <div className="container w-full max-w-6xl py-12 md:py-16">
      <div className="grid gap-8">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );

  const renderGuestHomepage = () => (
    <section className="container w-full max-w-6xl py-12 md:py-16">
        <div className="grid gap-10 md:gap-16">
          {/* Feature Cards Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-xl">
                  <CardHeader className="flex flex-row items-start gap-4 pb-4">
                    <div className={`p-3 rounded-full ${feature.bgColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-base font-body">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  <CardContent>
                    <Button asChild variant="link" className="p-0 text-accent font-semibold">
                      <Link href={feature.href}>
                        Explorer <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
  );

  return (
    <main className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-primary/5 py-12 md:py-20 lg:py-28 relative">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-headline text-primary">
            {user ? `Bienvenue, ${user.displayName || 'Utilisateur'}` : "Votre Santé, Connectée."}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl font-body">
            {user
              ? "Voici un aperçu de votre journée. Gérez votre santé en toute simplicité."
              : "SanteConnect est votre partenaire de confiance pour gérer les rendez-vous, vérifier les symptômes et adopter un mode de vie holistique."}
          </p>
          {!user && (
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/auth/signup">Créer un compte</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/login">Se connecter</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Section */}
      {isUserLoading 
        ? renderLoadingState()
        : user 
        ? <DashboardView user={user} />
        : renderGuestHomepage()
      }
    </main>
  );
}
