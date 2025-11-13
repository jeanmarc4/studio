
'use client';

import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { MyDoctorsList } from './components/my-doctors-list';
import { UpcomingAppointments } from './components/upcoming-appointments';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { AddDoctorDialog } from './components/add-doctor-dialog';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import type { MedicalProfessional } from '@/docs/backend-documentation';
import { v4 as uuidv4 } from 'uuid';

export default function MyHealthPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);

  // Redirect if user is not logged in
  if (!isUserLoading && !user) {
    router.push('/auth/login?redirect=/my-health');
    return null; 
  }
  
  const handleAddDoctor = (values: { name: string; specialty: string; address: string; phone: string; }) => {
    if (!firestore || !user) return;

    // 1. Create the new medical professional
    const newProfessional: MedicalProfessional = {
      ...values,
      id: uuidv4(),
      type: 'Médecin', // Default type
      location: ''
    };
    const profRef = collection(firestore, 'medicalProfessionals');
    addDocumentNonBlocking(profRef, newProfessional);

    // 2. Create a dummy appointment to link the user to the new doctor
    const appointmentRef = collection(firestore, 'users', user.uid, 'appointments');
    const dummyAppointment = {
      userId: user.uid,
      medicalProfessionalId: newProfessional.id,
      dateTime: new Date().toISOString(),
      reason: 'Ajout initial du médecin par le patient',
      status: 'archived', // Use 'archived' or a similar status to not show it as a real appointment
    };
    addDocumentNonBlocking(appointmentRef, dummyAppointment);
  };


  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-2/3 mt-2" />
        </header>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-1/4 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-10 w-1/2 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
            Mon Espace Santé
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-body">
            Votre tableau de bord personnel pour gérer vos médecins et rendez-vous.
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold font-headline text-gray-800 dark:text-gray-200">Mes Médecins</h2>
                 <Button variant="outline" onClick={() => setIsAddDoctorDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un médecin
                 </Button>
            </div>
              <MyDoctorsList />
          </div>
          <div className="lg:col-span-1">
              <UpcomingAppointments />
          </div>
        </div>
      </div>
      <AddDoctorDialog 
        isOpen={isAddDoctorDialogOpen}
        onOpenChange={setIsAddDoctorDialogOpen}
        onAddDoctor={handleAddDoctor}
      />
    </>
  );
}
