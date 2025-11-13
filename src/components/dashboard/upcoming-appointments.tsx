'use client';

import { useMemo, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Appointment } from '@/types';
import { useFirebase } from '@/firebase';

type AppointmentWithProfessional = Appointment & {
  professionalName?: string;
};

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const { firestore } = useFirebase();
  const router = useRouter();
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithProfessional[]>([]);

  useEffect(() => {
    if (!firestore || !appointments) return;

    const fetchUpcoming = async () => {
      const upcoming = appointments
        .filter(apt => new Date(apt.dateTime) >= new Date() && apt.status === 'scheduled')
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

      const enrichedAppointments = await Promise.all(
        upcoming.map(async apt => {
          if (!apt.medicalProfessionalId) return apt;
          const profRef = doc(firestore, 'medicalProfessionals', apt.medicalProfessionalId);
          const profSnap = await getDoc(profRef);
          return {
            ...apt,
            professionalName: profSnap.exists() ? profSnap.data().name : 'Professionnel inconnu'
          };
        })
      );
      setUpcomingAppointments(enrichedAppointments);
    };

    fetchUpcoming();
  }, [appointments, firestore]);

  return (
    <Card className="h-full bg-muted/30 dark:bg-card">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Rendez-vous à Venir</CardTitle>
        <CardDescription>Vos prochains rendez-vous.</CardDescription>
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
                        <p className="font-semibold">{apt.professionalName}</p>
                        <p className="text-sm text-muted-foreground">{format(appointmentDate, 'd MMMM yyyy', { locale: fr })}</p>
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
