import Image from "next/image";
import Link from "next/link";
import {
  Stethoscope,
  Sparkles,
  Leaf,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getImage } from "@/lib/placeholder-images";
import { SosAlert } from "@/components/sos-alert";
import { Badge } from "@/components/ui/badge";


const featureCards = [
  {
    icon: Stethoscope,
    title: "Annuaire Médical",
    description: "Trouvez des médecins, pharmacies et spécialistes près de chez vous. Prenez rendez-vous facilement.",
    href: "/directory",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-500",
    isPremium: false,
  },
  {
    icon: Sparkles,
    title: "Vérificateur de Symptômes IA",
    description: "Décrivez vos symptômes à notre IA pour une analyse préliminaire. (Ce n'est pas un diagnostic)",
    href: "/symptom-checker",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-500",
    isPremium: true,
  },
  {
    icon: Leaf,
    title: "Soins Holistiques",
    description: "Explorez des articles, des conseils et des guides sur le bien-être mental, physique et spirituel.",
    href: "/wellness",
    bgColor: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-500",
    isPremium: false,
  },
];

export default function Home() {
  const heroImage = getImage("hero-background");
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
              <Link href="/directory">Trouver un Médecin</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/symptom-checker">Vérifier les Symptômes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="container w-full max-w-6xl py-12 md:py-16">
        <div className="grid gap-10 md:gap-16">
          {/* SOS Section */}
          <div id="sos">
            <SosAlert />
          </div>

          {/* Feature Cards Section */}
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-xl">
                  <CardHeader className="flex flex-row items-start gap-4 pb-4">
                    <div className={`p-3 rounded-full ${feature.bgColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                      {feature.isPremium && (
                        <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">
                          <ShieldCheck className="mr-1 h-3 w-3" />
                          Premium
                        </Badge>
                      )}
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
    </main>
  );
}
