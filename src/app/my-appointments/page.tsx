
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getDoc, DocumentReference, query, where } from 'firebase/firestore';
import type { Appointment, MedicalProfessional } from '@/docs/backend-documentation';
import { AppointmentCard } from './components/appointment-card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarOff, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MyDoctorsList } from './components/my-doctors-list';
import { AddDoctorDialog } from './components/add-doctor-dialog';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid';
import { useProfile } from '@/hooks/use-profile';
import { AddAppointmentDialog } from './components/add-appointment-dialog';
import { Card } from '@/components/ui/card';

// Define a type for the combined appointment and professional data
type AppointmentWithProfessional = Appointment & {
  professional?: MedicalProfessional;
};

export default function MyAppointmentsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const { activeProfile } = useProfile();
  const router = useRouter();

  // State to hold combined appointment data
  const [appointmentsWithProf, setAppointmentsWithProf] = useState<AppointmentWithProfessional[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);


  // Redirect if user is not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect=/my-appointments');
    }
  }, [user, isUserLoading, router]);
  
  const handleAddDoctor = (values: { name: string; specialty: string; address?: string; phone?: string; }) => {
    if (!firestore || !user || !activeProfile) return;

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
      profileId: activeProfile.id,
      medicalProfessionalId: newProfessional.id,
      dateTime: new Date().toISOString(),
      reason: 'Ajout initial du médecin par le patient',
      status: 'archived', // Use 'archived' or a similar status to not show it as a real appointment
    };
    addDocumentNonBlocking(appointmentRef, dummyAppointment);
  };

  const handleAddAppointment = (values: { medicalProfessionalId: string; dateTime: Date; reason: string; }) => {
    if (!firestore || !user || !activeProfile) return;

    const newAppointment = {
        ...values,
        userId: user.uid,
        profileId: activeProfile.id,
        dateTime: values.dateTime.toISOString(),
        status: 'scheduled' as const,
    };

    const appointmentRef = collection(firestore, 'users', user.uid, 'appointments');
    addDocumentNonBlocking(appointmentRef, newAppointment);
  }

  // Memoize the query to fetch user's appointments
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !activeProfile) return null;
    return query(
        collection(firestore, 'users', user.uid, 'appointments'),
        where('profileId', '==', activeProfile.id)
    );
  }, [firestore, user, activeProfile]);

  // Fetch the appointments collection
  const { data: appointments, isLoading: areAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);

  // Effect to fetch professional details for each appointment
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
        // We filter out archived appointments from the main display list
        appointments.filter(apt => apt.status !== 'archived').map(async (apt) => {
          if (!apt.medicalProfessionalId) {
            return apt; 
          }
          const profRef = doc(firestore, 'medicalProfessionals', apt.medicalProfessionalId) as DocumentReference<MedicalProfessional>;
          try {
            const profSnap = await getDoc(profRef);
            if (profSnap.exists()) {
              return { ...apt, professional: profSnap.data() };
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


  if (isUserLoading || !user || !activeProfile) {
    return (
       <div className="container mx-auto px-4 py-8">
         <Skeleton className="h-12 w-full sm:w-1/3 mb-8" />
         <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="lg:col-span-1 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
         </div>
      </div>
    );
  }

  return (
    <>
        <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
                Espace Santé de {activeProfile.name}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground font-body">
              Consultez vos rendez-vous et la liste de vos professionnels de santé.
              </p>
            </div>
            <Button onClick={() => setIsAddAppointmentDialogOpen(true)} size="lg" className="shrink-0">
              <PlusCircle className="mr-2" />
              Ajouter un RDV
            </Button>
          </div>
        </header>

            <div className="grid gap-12 lg:grid-cols-3">
                <main className="lg:col-span-2">
                    <h2 className="text-2xl font-bold font-headline mb-4 text-gray-800 dark:text-gray-200">Historique des rendez-vous</h2>
                    {isDataLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-36 w-full" />
                            <Skeleton className="h-36 w-full" />
                            <Skeleton className="h-36 w-full" />
                        </div>
                    ) : appointmentsWithProf.length > 0 ? (
                        <div className="space-y-6">
                        {appointmentsWithProf.map((apt) => (
                            <AppointmentCard key={apt.id} appointment={apt} />
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <CalendarOff className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium text-muted-foreground">Aucun rendez-vous trouvé</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Vous n'avez pas encore de rendez-vous prévus.</p>
                            <Button onClick={() => setIsAddAppointmentDialogOpen(true)} className="mt-6">
                                Ajouter un rendez-vous
                            </Button>
                        </div>
                    )}
                </main>
                <aside className="lg:col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold font-headline text-gray-800 dark:text-gray-200">Mes Médecins</h2>
                        <Button variant="outline" onClick={() => setIsAddDoctorDialogOpen(true)} className="hidden sm:flex">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter
                        </Button>
                    </div>
                    <div className="sticky top-24 space-y-4">
                        <MyDoctorsList />
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-center mb-2">RDV Imprévu ?</h3>
                                <p className="text-sm text-muted-foreground text-center mb-4">
                                    Ajoutez un médecin qui n'est pas dans votre liste.
                                </p>
                                <Button className="w-full" onClick={() => setIsAddDoctorDialogOpen(true)}>
                                    Ajouter un médecin
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </aside>
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
      <AddAppointmentDialog
        isOpen={isAddAppointmentDialogOpen}
        onOpenChange={setIsAddAppointmentDialogOpen}
        onAddAppointment={handleAddAppointment}
       />
    </>
  );
}
