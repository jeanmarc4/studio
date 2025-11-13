
'use client';

import { User } from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { GuestHomepage } from '@/components/guest-homepage';
import { Skeleton } from '@/components/ui/skeleton';


function LoadingState() {
    return (
        <div className="container w-full max-w-6xl py-12 md:py-16">
            <div className="grid gap-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
}

export default function Home() {
  const { user, isUserLoading } = useFirebase();

  if (isUserLoading) {
    return <LoadingState />;
  }
  
  // If a user is logged in, show their dashboard.
  if (user) {
    return <DashboardView user={user} />;
  }

  // Otherwise, show the public homepage for guests.
  return <GuestHomepage />;
}
