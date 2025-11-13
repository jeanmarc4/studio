
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Prescription } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadPrescriptionDialog } from './components/upload-prescription-dialog';
import { PrescriptionCard } from './components/prescription-card';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { extractMedicationsFromPrescription, ExtractedMedication } from '@/ai/flows/extract-medications-flow';

export default function PrescriptionsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect=/prescriptions');
    }
  }, [isUserLoading, user, router]);

  const prescriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'prescriptions');
  }, [firestore, user]);

  const { data: prescriptions, isLoading: arePrescriptionsLoading } = useCollection<Prescription>(prescriptionsQuery);
  const isLoading = isUserLoading || arePrescriptionsLoading;

  const handleAddPrescription = (values: { doctorName: string; issueDate: Date; imageUrl: string; }) => {
    if (!user || !firestore) return;
    const newPrescription = {
      userId: user.uid,
      ...values,
      issueDate: values.issueDate.toISOString(),
      status: 'new' as const,
      extractedMedications: [],
    };
    const prescriptionsRef = collection(firestore, 'users', user.uid, 'prescriptions');
    addDocumentNonBlocking(prescriptionsRef, newPrescription);
  };
  
  const handleAnalyzePrescription = async (prescription: Prescription) => {
    if (!firestore || !user) return;
    const prescriptionRef = doc(firestore, 'users', user.uid, 'prescriptions', prescription.id);
    updateDocumentNonBlocking(prescriptionRef, { status: 'processing' });
    
    try {
      const result = await extractMedicationsFromPrescription({ prescriptionImageUrl: prescription.imageUrl });
      updateDocumentNonBlocking(prescriptionRef, { 
        status: 'processed',
        extractedMedications: result.medications 
      });
    } catch (error) {
      console.error("Erreur lors de l'analyse de l'ordonnance:", error);
      updateDocumentNonBlocking(prescriptionRef, { status: 'error' });
    }
  };

  const handleAddMedicationToTreatment = (medication: ExtractedMedication) => {
    if (!user || !firestore) return;
    const medicationsRef = collection(firestore, 'users', user.uid, 'medications');
    const newMed = {
      userId: user.uid,
      name: medication.name,
      dosage: medication.dosage,
      quantity: medication.quantity || 1, // Default to 1 if not present
      // Map string times like 'matin', 'soir' to HH:mm, or keep as is if format is different
      intakeTimes: medication.intakeTimes.map(time => {
          if (time.toLowerCase() === 'matin') return '08:00';
          if (time.toLowerCase() === 'midi') return '12:00';
          if (time.toLowerCase() === 'soir') return '20:00';
          // If it's already a time format or something else, keep it. Validation on the medication form is stricter.
          return time;
      })
    };
    addDocumentNonBlocking(medicationsRef, newMed);
  };

  if (isLoading || !user) {
    return (
         <div className="container mx-auto px-4 py-8">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <Skeleton className="h-12 w-56 hidden sm:block" />
            </header>
            <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
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
              Mes Ordonnances
            </h1>
            <p className="mt-2 text-lg text-muted-foreground font-body">
              Gérez vos ordonnances et ajoutez vos médicaments facilement.
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)} size="lg" className="hidden sm:inline-flex mt-4">
            <PlusCircle className="mr-2" />
            Ajouter une ordonnance
          </Button>
        </header>

        {prescriptions && prescriptions.length > 0 ? (
          <div className="space-y-6">
            {prescriptions.map((p) => (
              <PrescriptionCard 
                key={p.id} 
                prescription={p} 
                onAnalyze={handleAnalyzePrescription}
                onAddMedication={handleAddMedicationToTreatment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">Aucune ordonnance</h3>
            <p className="mt-2 text-sm text-muted-foreground">Commencez par ajouter votre première ordonnance.</p>
            <Button className="mt-6" onClick={() => setIsUploadDialogOpen(true)}>
              Ajouter une ordonnance
            </Button>
          </div>
        )}
      </div>

       <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <Button size="lg" className="rounded-full h-16 w-16 shadow-lg flex items-center justify-center" onClick={() => setIsUploadDialogOpen(true)}>
          <PlusCircle className="h-8 w-8" />
        </Button>
      </div>

      <UploadPrescriptionDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onAddPrescription={handleAddPrescription}
      />
    </>
  );
}

    