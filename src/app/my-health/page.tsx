

'use client';

import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { MyDoctorsList } from './components/my-doctors-list';
import { UpcomingAppointments } from './components/upcoming-appointments';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddDoctorDialog } from './components/add-doctor-dialog';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import type { Appointment, MedicalProfessional } from '@/docs/backend-documentation';
import { v4 as uuidv4 } from 'uuid';
import { AppointmentCard } from '../my-appointments/components/appointment-card';
import { CalendarOff } from 'lucide-react';
import Link from 'next/link';

type AppointmentWithProfessional = Appointment & {
  professional?: MedicalProfessional;
};

export default function MyHealthPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);
  const [appointmentsWithProf, setAppointmentsWithProf] = useState<AppointmentWithProfessional[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect=/my-health');
    }
  }, [isUserLoading, user, router]);
  
  const handleAddDoctor = (values: { name: string; specialty: string; address?: string; phone?: string; }) => {
    if (!firestore || !user) return;

    // 1. Create the new medical professional
    const newProfessional: MedicalProfessional = {
      ...values,
      id: uuidv4(),
      type: 'Médecin', // Default type
      location: ''
    };
    const profRef = doc(firestore, 'medicalProfessionals', newProfessional.id);
    setDocumentNonBlocking(profRef, newProfessional, {});

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

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'appointments');
  }, [firestore, user]);

  const { data: appointments, isLoading: areAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
  
    useEffect(() => {
    if (!appointments || !firestore) {
      if (!areAppointmentsLoading) {
        setIsDataLoading(false);
        setAppointmentsWithProf([]);
      }
      return;
    };

    const fetchProfessionalData = async () => {
      setIsDataLoading(true);
      const enrichedAppointments = await Promise.all(
        appointments.filter(apt => apt.status !== 'archived').map(async (apt) => {
          if (!apt.medicalProfessionalId) {
            return apt;
          }
          const profRef = doc(firestore, 'medicalProfessionals', apt.medicalProfessionalId);
          try {
            const profSnap = await doc(profRef).get();
            if (profSnap.exists()) {
              return { ...apt, professional: profSnap.data() as MedicalProfessional };
            }
          } catch (error) {
            console.error(`Failed to fetch professional ${apt.medicalProfessionalId}:`, error);
          }
          return apt;
        })
      );
      enrichedAppointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      setAppointmentsWithProf(enrichedAppointments);
      setIsDataLoading(false);
    };

    fetchProfessionalData();
  }, [appointments, firestore, areAppointmentsLoading]);


  if (isUserLoading || !user) {
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
          <div className="lg:col-span-2 order-2 lg:order-1">
             <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold font-headline text-gray-800 dark:text-gray-200">Mes Médecins</h2>
                 <Button variant="outline" onClick={() => setIsAddDoctorDialogOpen(true)} className="hidden sm:flex">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter
                 </Button>
            </div>
              <MyDoctorsList />
          </div>
          <div className="lg:col-span-1 order-1 lg:order-2">
              <UpcomingAppointments appointments={appointments || []} />
          </div>
        </div>
      </div>

       <div className="sm:hidden fixed bottom-4 right-4 z-50">
            <Button size="lg" className="rounded-full h-16 w-16 shadow-lg flex items-center justify-center" onClick={() => setIsAddDoctorDialogOpen(true)}>
                <PlusCircle className="h-8 w-8" />
            </Button>
        </div>
      <AddDoctorDialog 
        isOpen={isAddDoctorDialogOpen}
        onOpenChange={setIsAddDoctorDialogOpen}
        onAddDoctor={handleAddDoctor}
      />
    </>
  );
}

