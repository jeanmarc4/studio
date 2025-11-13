import Image from "next/image";
import Link from "next/link";
import {
  Stethoscope,
  Sparkles,
  Leaf,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getImage } from "@/lib/placeholder-images";
import { SosAlert } from "@/components/sos-alert";


const featureCards = [
  {
    icon: Stethoscope,
    title: "Medical Directory",
    description: "Find doctors, pharmacies, and specialists near you. Book appointments with ease.",
    href: "/directory",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-500",
  },
  {
    icon: Sparkles,
    title: "AI Symptom Checker",
    description: "Describe your symptoms to our AI for a preliminary analysis. (Not a diagnosis)",
    href: "/symptom-checker",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-500",
  },
  {
    icon: Leaf,
    title: "Holistic Wellness",
    description: "Explore articles, tips, and guides on mental, physical, and spiritual well-being.",
    href: "/wellness",
    bgColor: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-500",
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
            Your Health, Connected.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl font-body">
            SanteConnect is your trusted partner for managing appointments, checking symptoms, and embracing a holistic lifestyle.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/directory">Find a Doctor</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/symptom-checker">Check Symptoms</Link>
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
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <div className={`p-3 rounded-full ${feature.bgColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-base font-body">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  <CardContent>
                    <Button asChild variant="link" className="p-0 text-accent font-semibold">
                      <Link href={feature.href}>
                        Explore <ArrowRight className="ml-2 h-4 w-4" />
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
