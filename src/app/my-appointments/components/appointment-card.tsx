
'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Stethoscope, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Appointment, MedicalProfessional } from '@/docs/backend-documentation';
import { doctors } from '@/lib/data';
import Image from 'next/image';

type AppointmentWithProfessional = Appointment & {
  professional?: MedicalProfessional;
};

interface AppointmentCardProps {
  appointment: AppointmentWithProfessional;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { professional, dateTime, status } = appointment;

  const appointmentDate = new Date(dateTime);

  const getStatusVariant = (): 'secondary' | 'default' | 'destructive' | 'outline' => {
    switch (status) {
      case 'scheduled':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getDoctorImage = (professionalId: string) => {
    const doctor = doctors.find(d => d.id === professionalId);
    return doctor ? { src: doctor.image, hint: doctor.imageHint } : null;
  }

  const doctorImage = professional?.id ? getDoctorImage(professional.id) : null;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
            {professional && doctorImage?.src && (
                <Image
                    src={doctorImage.src}
                    alt={`Photo de ${professional.name}`}
                    width={80}
                    height={80}
                    className="rounded-full border hidden sm:block"
                    data-ai-hint={doctorImage.hint}
                />
            )}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
              <CardTitle className="font-headline text-xl mb-2 sm:mb-0">
                {professional?.name || 'Professionnel non trouvé'}
              </CardTitle>
              <Badge variant={getStatusVariant()} className="w-fit capitalize">
                {status}
              </Badge>
            </div>
            {professional && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  <span>{professional.specialty || professional.type}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{professional.address}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
          <div className="flex items-center text-primary font-semibold mb-2 sm:mb-0">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{format(appointmentDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center text-primary font-semibold">
            <Clock className="mr-2 h-4 w-4" />
            <span>{format(appointmentDate, 'HH:mm')}</span>
          </div>
        </div>
        {appointment.reason && (
             <div className="mt-4 text-sm">
                <p className="font-semibold">Motif de la visite :</p>
                <p className="text-muted-foreground italic">"{appointment.reason}"</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
