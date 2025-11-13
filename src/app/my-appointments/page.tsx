
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getDoc, DocumentReference } from 'firebase/firestore';
import type { Appointment, MedicalProfessional } from '@/docs/backend-documentation';
import { AppointmentCard } from './components/appointment-card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarOff } from 'lucide-react';

// Define a type for the combined appointment and professional data
type AppointmentWithProfessional = Appointment & {
  professional?: MedicalProfessional;
};

export default function MyAppointmentsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();

  // State to hold combined appointment data
  const [appointmentsWithProf, setAppointmentsWithProf] = useState<AppointmentWithProfessional[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect=/my-appointments');
    }
  }, [user, isUserLoading, router]);

  // Memoize the query to fetch user's appointments
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'appointments');
  }, [firestore, user]);

  // Fetch the appointments collection
  const { data: appointments, isLoading: areAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);

  // Effect to fetch professional details for each appointment
  useEffect(() => {
    if (!appointments || !firestore) {
      // If there are no appointments or firestore is not ready, we might be done loading.
      if (!areAppointmentsLoading) {
        setIsDataLoading(false);
        setAppointmentsWithProf([]);
      }
      return;
    };

    const fetchProfessionalData = async () => {
      setIsDataLoading(true);
      const enrichedAppointments = await Promise.all(
        appointments.map(async (apt) => {
          if (!apt.medicalProfessionalId) {
            return apt; // Return appointment as is if no professional ID
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
          return apt; // Return original appointment if fetch fails or doc doesn't exist
        })
      );
      // Sort appointments by date, most recent first
      enrichedAppointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      setAppointmentsWithProf(enrichedAppointments);
      setIsDataLoading(false);
    };

    fetchProfessionalData();
  }, [appointments, firestore, areAppointmentsLoading]);


  if (isUserLoading) {
    return (
       <div className="container mx-auto px-4 py-8">
         <Skeleton className="h-12 w-1/3 mb-8" />
         <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
         </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
          Mes Rendez-vous
        </h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">
          Consultez et gérez vos prochains rendez-vous.
        </p>
      </header>

      {isDataLoading ? (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
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
            <Button asChild className="mt-6">
                <Link href="/directory">Prendre un rendez-vous</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
