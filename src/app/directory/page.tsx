
'use client';

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { DoctorCard } from "./components/doctor-card";
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { MedicalProfessional } from '@/docs/backend-documentation';
import { staticDoctorImages } from "@/lib/data";
import { Skeleton } from '@/components/ui/skeleton';
import type { PopulatedMedicalProfessional } from '@/types';


export default function DirectoryPage() {
  const { firestore } = useFirebase();

  const professionalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'medicalProfessionals');
  }, [firestore]);

  const { data: professionals, isLoading } = useCollection<MedicalProfessional>(professionalsQuery);

  const doctors = useMemo(() => {
    if (!professionals) return [];
    return professionals.map(prof => {
      const staticDoctor = staticDoctorImages.find(d => d.id === prof.id);
      return {
        ...prof,
        // Ces champs n'existent pas dans le schéma, nous les ajoutons pour l'affichage
        rating: staticDoctor?.rating || 4.5,
        reviews: staticDoctor?.reviews || 0,
        availability: staticDoctor?.availability || [],
        image: staticDoctor?.image,
        imageHint: staticDoctor?.imageHint,
      };
    })
  }, [professionals]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Annuaire Médical</h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">Trouvez le professionnel de la santé qui répond à vos besoins.</p>
      </header>

      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par nom, spécialité ou lieu..."
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      <Tabs defaultValue="doctors" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto h-12">
          <TabsTrigger value="doctors" className="h-full text-base">Médecins</TabsTrigger>
          <TabsTrigger value="pharmacies" className="h-full text-base">Pharmacies</TabsTrigger>
          <TabsTrigger value="holistic" className="h-full text-base">Soins Holistiques</TabsTrigger>
        </TabsList>
        <TabsContent value="doctors" className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[350px] w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor as PopulatedMedicalProfessional} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="pharmacies" className="mt-8 text-center">
          <p className="text-muted-foreground">Annuaire des pharmacies bientôt disponible.</p>
        </TabsContent>
        <TabsContent value="holistic" className="mt-8 text-center">
          <p className="text-muted-foreground">Annuaire des fournisseurs de soins holistiques bientôt disponible.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
