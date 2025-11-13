
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Vaccine } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddVaccineDialog } from './components/add-vaccine-dialog';
import { VaccineCard } from './components/vaccine-card';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VaccinationsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect=/vaccinations');
    }
  }, [isUserLoading, user, router]);

  const vaccinesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'vaccines'), orderBy('date', 'desc'));
  }, [firestore, user]);

  const { data: vaccines, isLoading: areVaccinesLoading } = useCollection<Vaccine>(vaccinesQuery);

  const handleAddVaccine = (values: Omit<Vaccine, 'id' | 'userId'>) => {
    if (!user || !firestore) return;
    const newVaccine = {
      userId: user.uid,
      ...values,
      date: values.date.toISOString(),
      nextBooster: values.nextBooster?.toISOString() || null,
    };
    const vaccinesRef = collection(firestore, 'users', user.uid, 'vaccines');
    addDocumentNonBlocking(vaccinesRef, newVaccine);
  };

  const isLoading = isUserLoading || areVaccinesLoading;

  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-12 w-52 hidden sm:block" />
        </header>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center sm:text-left">
          <div>
            <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
              Mon Carnet de Vaccination
            </h1>
            <p className="mt-2 text-lg text-muted-foreground font-body">
              Suivez vos vaccins et ne manquez jamais un rappel.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="hidden sm:inline-flex mt-4">
            <PlusCircle className="mr-2" />
            Ajouter un vaccin
          </Button>
        </header>

        <Alert className="mb-8">
            <Shield className="h-4 w-4"/>
            <AlertTitle>Rappels Importants</AlertTitle>
            <AlertDescription>
                Les vaccins avec un rappel prévu dans moins de 3 mois sont mis en évidence en orange. Ceux dont la date de rappel est dépassée apparaissent en rouge.
            </AlertDescription>
        </Alert>

        {vaccines && vaccines.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vaccines.map((v) => (
              <VaccineCard key={v.id} vaccine={v} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">Aucun vaccin enregistré</h3>
            <p className="mt-2 text-sm text-muted-foreground">Commencez par ajouter votre premier vaccin.</p>
            <Button className="mt-6" onClick={() => setIsAddDialogOpen(true)}>
              Ajouter un vaccin
            </Button>
          </div>
        )}
      </div>

      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <Button size="lg" className="rounded-full h-16 w-16 shadow-lg flex items-center justify-center" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="h-8 w-8" />
        </Button>
      </div>

      <AddVaccineDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddVaccine={handleAddVaccine}
      />
    </>
  );
}

    