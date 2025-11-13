'use client';

import { User } from 'firebase/auth';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Medication, Appointment } from '@/types';
import { TodaysMedications } from './todays-medications';
import { UpcomingAppointments } from './upcoming-appointments';
import { QuickAccess } from './quick-access';
import { SosAlert } from '@/components/sos-alert';
import { Skeleton } from '../ui/skeleton';

interface DashboardViewProps {
  user: User;
}

export function DashboardView({ user }: DashboardViewProps) {
  const { firestore } = useFirebase();

  const medicationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'medications');
  }, [firestore, user]);

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'appointments');
  }, [firestore, user]);

  const { data: medications, isLoading: areMedicationsLoading } = useCollection<Medication>(medicationsQuery);
  const { data: appointments, isLoading: areAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);

  const isLoading = areMedicationsLoading || areAppointmentsLoading;

  return (
    <div className="container w-full max-w-6xl py-12 md:py-16">
      <div className="grid gap-8">
        <SosAlert />
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-64 w-full lg:col-span-2" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TodaysMedications medications={medications || []} />
            </div>
            <div>
              <UpcomingAppointments appointments={appointments || []} />
            </div>
          </div>
        )}
        <QuickAccess />
      </div>
    </div>
  );
}
