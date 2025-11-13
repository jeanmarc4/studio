
'use client';

import { useMemo, useEffect, useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getDoc, DocumentReference } from 'firebase/firestore';
import Image from 'next/image';
import { Stethoscope, MapPin, Phone, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { staticDoctorImages } from '@/lib/data';
import type { Appointment, MedicalProfessional } from '@/docs/backend-documentation';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type EnrichedProfessional = MedicalProfessional & {
  image?: string;
  imageHint?: string;
  nextAppointment?: Appointment;
};

export function MyDoctorsList() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const [doctors, setDoctors] = useState<EnrichedProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'appointments');
  }, [firestore, user]);

  const { data: appointments, isLoading: areAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);

  useEffect(() => {
    const isDataReady = !isUserLoading && !areAppointmentsLoading && firestore;
    if (!isDataReady) return;
    
    if (!appointments) {
        setDoctors([]);
        setIsLoading(false);
        return;
    }

    const fetchDoctors = async () => {
      // Filter out dummy/archived appointments before processing
      const realAppointments = appointments.filter(apt => apt.status !== 'archived');
      const professionalIds = [...new Set(realAppointments.map(apt => apt.medicalProfessionalId))];
      
      const uniqueDoctors: EnrichedProfessional[] = [];
      const fetchedIds = new Set();

      for (const id of professionalIds) {
        if (!id || fetchedIds.has(id)) continue;
        
        const profRef = doc(firestore, 'medicalProfessionals', id) as DocumentReference<MedicalProfessional>;
        const profSnap = await getDoc(profRef);

        if (profSnap.exists()) {
          const professional = profSnap.data();
          const staticData = staticDoctorImages.find(d => d.id === professional.id);

          // Find the next upcoming appointment for this doctor from the real appointments
          const nextAppointment = realAppointments
            .filter(apt => apt.medicalProfessionalId === id && new Date(apt.dateTime) > new Date() && apt.status === 'scheduled')
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

          uniqueDoctors.push({
            ...professional,
            image: staticData?.image,
            imageHint: staticData?.imageHint,
            nextAppointment: nextAppointment,
          });
          fetchedIds.add(id);
        }
      }

      setDoctors(uniqueDoctors);
      setIsLoading(false);
    };

    fetchDoctors();
  }, [appointments, areAppointmentsLoading, isUserLoading, firestore]);

  const handleBookAppointmentClick = () => {
    // This could eventually link to a specific doctor's booking page
    // For now, it's a general action.
  }

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  return (
    <>
      {doctors.length > 0 ? (
        <div className="space-y-4">
          {doctors.map(doctor => (
            <Card key={doctor.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start gap-4">
                {doctor.image && (
                  <Image
                    src={doctor.image}
                    alt={`Photo de ${doctor.name}`}
                    width={100}
                    height={100}
                    className="rounded-lg border object-cover"
                    data-ai-hint={doctor.imageHint}
                  />
                )}
                <div className="flex-grow space-y-2">
                  <h3 className="text-lg font-bold text-primary">{doctor.name}</h3>
                  <p className="flex items-center text-sm text-muted-foreground">
                    <Stethoscope className="mr-2 h-4 w-4 flex-shrink-0" />
                    {doctor.specialty}
                  </p>
                  <p className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                    {doctor.address}
                  </p>
                   <p className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                    {doctor.phone}
                  </p>
                  {doctor.nextAppointment && (
                    <div className="p-3 bg-accent/10 rounded-md border border-accent/20">
                      <p className="font-semibold text-accent-foreground/90 text-sm mb-1">Prochain RDV :</p>
                      <div className="flex items-center text-sm text-accent-foreground/80">
                         <Calendar className="mr-2 h-4 w-4" />
                         <span>{format(new Date(doctor.nextAppointment.dateTime), 'EEEE d MMMM', { locale: fr })}</span>
                         <Clock className="ml-4 mr-2 h-4 w-4" />
                         <span>{format(new Date(doctor.nextAppointment.dateTime), 'HH:mm')}</span>
                      </div>
                    </div>
                  )}
                </div>
                 <Button onClick={handleBookAppointmentClick} className="w-full mt-4 sm:w-auto sm:mt-0 self-center sm:self-end" disabled>
                    Prendre RDV
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">Aucun médecin trouvé</h3>
            <p className="mt-2 text-sm text-muted-foreground">Commencez par ajouter un médecin à votre liste.</p>
        </div>
      )}
    </>
  );
}
