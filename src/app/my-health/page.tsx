
'use client';

import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { MyDoctorsList } from './components/my-doctors-list';
import { UpcomingAppointments } from './components/upcoming-appointments';

export default function MyHealthPage() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  // Redirect if user is not logged in
  if (!isUserLoading && !user) {
    router.push('/auth/login?redirect=/my-health');
    return null; 
  }

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
            <MyDoctorsList />
        </div>
        <div className="lg:col-span-1">
            <UpcomingAppointments />
        </div>
      </div>
    </div>
  );
}
