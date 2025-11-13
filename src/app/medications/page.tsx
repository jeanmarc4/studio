
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Medication } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pill, HelpCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MedicationCard } from './components/medication-card';
import { AddMedicationDialog } from './components/add-medication-dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EditMedicationDialog } from './components/edit-medication-dialog';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function MedicationsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect=/medications');
    }
  }, [isUserLoading, user, router]);

  const medicationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'medications');
  }, [firestore, user]);

  const { data: medications, isLoading: areMedicationsLoading } = useCollection<Medication>(medicationsQuery);

  const handleEditClick = (medication: Medication) => {
    setMedicationToEdit(medication);
    setIsEditDialogOpen(true);
  }

  const handleUpdateMedication = (data: Partial<Medication>) => {
    if (!user || !firestore || !medicationToEdit) return;
    const medRef = doc(firestore, 'users', user.uid, 'medications', medicationToEdit.id);
    updateDocumentNonBlocking(medRef, data);
  };

  const isLoading = isUserLoading || areMedicationsLoading;
  
  if (isLoading || !user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2 text-center sm:text-left">
                    <Skeleton className="h-10 w-64 mx-auto sm:mx-0" />
                    <Skeleton className="h-6 w-96 mx-auto sm:mx-0" />
                </div>
                <Skeleton className="h-12 w-52 hidden sm:block" />
            </header>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center sm:text-left">
          <div>
            <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
              Mon Traitement
            </h1>
            <p className="mt-2 text-lg text-muted-foreground font-body">
              Gérez vos médicaments et ne manquez jamais une prise.
            </p>
          </div>
           <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="hidden sm:inline-flex mt-4">
            <PlusCircle className="mr-2" />
            Ajouter un médicament
          </Button>
        </header>

        <Alert className="mb-8 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
            <HelpCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle className="font-semibold text-blue-800 dark:text-blue-300">Comment fonctionnent les rappels ?</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
                Vous pouvez tester les rappels sur chaque carte de médicament. Dans une future version, ces rappels seront automatiques.
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><span className="font-semibold">Standard :</span> Une notification simple s'affichera.</li>
                    <li><span className="font-semibold">Premium & Admin :</span> En plus de la notification, vous aurez un rappel vocal intelligent généré par notre IA.</li>
                </ul>
            </AlertDescription>
        </Alert>

        {medications && medications.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {medications.map((med) => (
              <MedicationCard key={med.id} medication={med} onEdit={() => handleEditClick(med)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">Aucun médicament</h3>
            <p className="mt-2 text-sm text-muted-foreground">Commencez par ajouter votre premier médicament.</p>
            <Button className="mt-6" onClick={() => setIsAddDialogOpen(true)}>
              Ajouter un médicament
            </Button>
          </div>
        )}
      </div>

       <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <Button size="lg" className="rounded-full h-16 w-16 shadow-lg flex items-center justify-center" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="h-8 w-8" />
        </Button>
      </div>

      <AddMedicationDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      {medicationToEdit && (
        <EditMedicationDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          medication={medicationToEdit}
          onUpdate={handleUpdateMedication}
        />
      )}
    </>
  );
}
