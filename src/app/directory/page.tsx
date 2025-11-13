
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Query } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Stethoscope } from 'lucide-react';
import type { MedicalProfessional } from '@/docs/backend-documentation';
import { ProfessionalCard } from './components/professional-card';
import { staticDoctorImages } from '@/lib/data';

// Enrichir les données du professionnel avec des données statiques pour l'affichage
type EnrichedProfessional = MedicalProfessional & {
  image?: string;
  imageHint?: string;
  rating?: number;
  reviews?: number;
};

export default function DirectoryPage() {
  const { firestore } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const professionalsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'medicalProfessionals') as Query<MedicalProfessional>;
  }, [firestore]);

  const { data: professionals, isLoading } = useCollection<MedicalProfessional>(professionalsQuery);

  const enrichedProfessionals: EnrichedProfessional[] = useMemo(() => {
    if (!professionals) return [];
    return professionals.map((prof, index) => {
      const staticData = staticDoctorImages.find(d => d.id === prof.id) || staticDoctorImages[index % staticDoctorImages.length];
      return {
        ...prof,
        ...staticData,
      };
    });
  }, [professionals]);

  const specialties = useMemo(() => {
    if (!enrichedProfessionals) return [];
    const allSpecialties = enrichedProfessionals.map(p => p.specialty).filter(Boolean);
    return ['all', ...Array.from(new Set(allSpecialties))];
  }, [enrichedProfessionals]);

  const filteredProfessionals = useMemo(() => {
    return enrichedProfessionals
      .filter(prof =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(prof =>
        specialtyFilter === 'all' || prof.specialty === specialtyFilter
      );
  }, [enrichedProfessionals, searchTerm, specialtyFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
          Annuaire Médical
        </h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">
          Trouvez un professionnel de santé près de chez vous.
        </p>
      </header>

      <div className="mb-8 p-4 bg-muted/50 rounded-lg sticky top-16 z-10 backdrop-blur-sm">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            placeholder="Rechercher par nom ou spécialité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-base"
          />
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="text-base">
              <SelectValue placeholder="Filtrer par spécialité" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map(spec => (
                <SelectItem key={spec} value={spec}>
                  {spec === 'all' ? 'Toutes les spécialités' : spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[350px] w-full" />
          ))}
        </div>
      ) : filteredProfessionals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProfessionals.map(prof => (
            <ProfessionalCard key={prof.id} professional={prof} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">Aucun professionnel trouvé</h3>
          <p className="mt-2 text-sm text-muted-foreground">Essayez d'ajuster vos critères de recherche.</p>
        </div>
      )}
    </div>
  );
}
