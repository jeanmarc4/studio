
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Prescription } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadPrescriptionDialog } from './components/upload-prescription-dialog';
import { PrescriptionCard } from './components/prescription-card';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { extractMedicationsFromPrescription, ExtractedMedication } from '@/ai/flows/extract-medications-flow';
import { useProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';

export default function PrescriptionsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const { activeProfile } = useProfile();
  const router = useRouter();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect=/prescriptions');
    }
  }, [isUserLoading, user, router]);

  const prescriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !activeProfile) return null;
    return query(
      collection(firestore, 'users', user.uid, 'prescriptions'),
      where('profileId', '==', activeProfile.id)
    );
  }, [firestore, user, activeProfile]);

  const { data: prescriptions, isLoading: arePrescriptionsLoading } = useCollection<Prescription>(prescriptionsQuery);
  const isLoading = isUserLoading || arePrescriptionsLoading;

  const handleAddPrescription = (values: { doctorName: string; issueDate: Date; imageUrl: string; }) => {
    if (!user || !firestore || !activeProfile) return;
    const newPrescription = {
      userId: user.uid,
      profileId: activeProfile.id,
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
    if (!user || !firestore || !activeProfile) return;
    
    // Default times if none are provided
    const defaultTimes = ['08:00', '20:00'];

    // More robust time conversion
    const convertIntakeTimes = (times: string[] | undefined): string[] => {
        if (!times || times.length === 0) return defaultTimes;

        const timeMap: { [key: string]: string } = {
            'matin': '08:00',
            'midi': '12:00',
            'soir': '20:00',
        };

        const converted = times.map(t => {
            const timeStr = t.toLowerCase();
            // Check for direct mapping
            if (timeMap[timeStr]) return timeMap[timeStr];
            // Check for "fois par jour"
            if (timeStr.includes('1 fois par jour')) return ['12:00'];
            if (timeStr.includes('2 fois par jour')) return ['08:00', '20:00'];
            if (timeStr.includes('3 fois par jour')) return ['08:00', '12:00', '20:00'];
            // If it's already in HH:mm format
            if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) return [timeStr];
            return null; // Return null for unhandled cases
        }).flat().filter((t): t is string => t !== null);

        // Remove duplicates and return, or default if conversion failed
        return converted.length > 0 ? [...new Set(converted)] : defaultTimes;
    };


    const medicationsRef = collection(firestore, 'users', user.uid, 'medications');
    const newMed = {
      userId: user.uid,
      profileId: activeProfile.id,
      name: medication.name,
      dosage: medication.dosage,
      quantity: medication.quantity || 1, // Default to 1 if not provided
      intakeTimes: convertIntakeTimes(medication.intakeTimes),
    };
    addDocumentNonBlocking(medicationsRef, newMed);
    
    toast({
      title: "Médicament ajouté",
      description: `${medication.name} a été ajouté au traitement de ${activeProfile.name}.`,
    });
  };

  if (isLoading || !user || !activeProfile) {
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
              Ordonnances de {activeProfile.name}
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
            {prescriptions.sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).map((p) => (
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

