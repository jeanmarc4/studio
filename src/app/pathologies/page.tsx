'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, Droplets } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const pathologies = [
    {
        name: "Suivi Cardiaque",
        description: "Enregistrez et suivez votre tension et votre pouls.",
        slug: "cardiac",
        icon: HeartPulse,
        color: "text-red-500",
        bgColor: "bg-red-500/10"
    },
    {
        name: "Suivi du Diabète",
        description: "Enregistrez et visualisez vos mesures de glycémie.",
        slug: "diabetes",
        icon: Droplets,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
    }
]

export default function PathologiesPage() {

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-foreground font-headline">
          Suivi des Pathologies
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Sélectionnez une pathologie pour commencer le suivi de vos symptômes et de vos données de santé.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {pathologies.map((pathology) => {
            return (
            <Link 
                key={pathology.slug} 
                href={`/pathologies/${pathology.slug}`}
                className="block h-full transform hover:scale-105 transition-transform duration-200"
            >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-full", pathology.bgColor)}>
                        <pathology.icon className={cn("w-6 h-6", pathology.color)} />
                    </div>
                    <CardTitle className="font-headline text-2xl">{pathology.name}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{pathology.description}</p>
                </CardContent>
                </Card>
            </Link>
            )
        })}
      </div>
    </div>
  );
}
