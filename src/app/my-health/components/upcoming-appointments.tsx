
'use client';

import { useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Appointment } from '@/docs/backend-documentation';

export function UpcomingAppointments() {
  const { user, firestore } = useFirebase();
  const router = useRouter();

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'appointments');
  }, [firestore, user]);

  const { data: appointments, isLoading } = useCollection<Appointment>(appointmentsQuery);

  const upcomingAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(apt => new Date(apt.dateTime) >= new Date() && apt.status === 'scheduled')
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [appointments]);

  if (isLoading) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Rappels de Rendez-vous</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-muted/30 dark:bg-card">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Rappels de Rendez-vous</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length > 0 ? (
          <ul className="space-y-4">
            {upcomingAppointments.slice(0, 3).map(apt => {
                const appointmentDate = new Date(apt.dateTime);
                const isSoon = (appointmentDate.getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000;
              return (
                <li key={apt.id} className="p-3 bg-background rounded-lg border flex items-start gap-4">
                   {isSoon && <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />}
                   <div className="flex-grow">
                        <p className="font-semibold">{format(appointmentDate, 'd MMMM yyyy', { locale: fr })}</p>
                        <p className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" />
                            {format(appointmentDate, 'HH:mm')}
                        </p>
                   </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            Aucun rendez-vous à venir.
          </p>
        )}
         <Button className="w-full mt-6" variant="outline" onClick={() => router.push('/my-appointments')}>
            Voir tous les rendez-vous
        </Button>
      </CardContent>
    </Card>
  );
}
