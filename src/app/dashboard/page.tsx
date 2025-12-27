'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, PlusCircle, ChevronRight, Pill, Stethoscope, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, Timestamp, query, where, orderBy, limit } from 'firebase/firestore';
import type { Medication, Appointment } from "@/lib/types";
import { Logo } from "@/components/icons";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('fr-FR', { weekday: 'long' });
  const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  const medicationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const medCol = collection(firestore, `users/${user.uid}/medications`);
    // This query is not perfect as it fetches all meds and filters client-side.
    // For a large number of medications, a more optimized query or data structure would be needed.
    return query(medCol, where('days', 'array-contains', capitalizedDay));
  }, [firestore, user, capitalizedDay]);

  const appointmentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const apptCol = collection(firestore, `users/${user.uid}/appointments`);
    return query(apptCol, where('dateTime', '>=', new Date()), orderBy('dateTime', 'asc'), limit(1));
  }, [firestore, user]);

  const { data: medicationsToday, isLoading: isLoadingMedications } = useCollection<Medication>(medicationsQuery);
  const { data: upcomingAppointments, isLoading: isLoadingAppointments } = useCollection<Appointment>(appointmentsQuery);

  const upcomingAppointment = upcomingAppointments?.[0];

  const isLoading = isUserLoading || isLoadingMedications || isLoadingAppointments;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-4">
            <Logo className="h-12 w-12 text-primary"/>
            <div>
                <h1 className="text-4xl font-bold text-foreground font-headline">
                Bonjour, {user?.displayName || 'Utilisateur'}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                Voici un résumé de votre journée.
                </p>
            </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Pill className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl font-headline">Médicaments du Jour</CardTitle>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/medications">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {medicationsToday && medicationsToday.length > 0 ? (
              medicationsToday.slice(0, 3).map((med) => (
                <div key={med.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <Clock className="w-4 h-4" />
                    <span>{med.times.join(', ')}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucun médicament prévu aujourd'hui.</p>
            )}
            <Button size="lg" className="w-full gap-2 mt-4" asChild>
              <Link href="/medications">
                <PlusCircle className="w-5 h-5" />
                Gérer les médicaments
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl font-headline">Rendez-vous</CardTitle>
              </div>
               <Button variant="ghost" size="icon" asChild>
                <Link href="/appointments">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointment ? (
                 <div className="space-y-4">
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground capitalize">{format(upcomingAppointment.dateTime.toDate(), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                    <p className="font-semibold text-foreground mt-1">{upcomingAppointment.doctorName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Stethoscope className="w-4 h-4" />{upcomingAppointment.doctorSpecialty}</p>
                  </div>
                  <Button size="lg" className="w-full gap-2" variant="outline" asChild>
                    <Link href="/appointments">
                      <Calendar className="w-5 h-5" />
                      Voir tous les rendez-vous
                    </Link>
                  </Button>
                </div>
              ) : (
                 <>
                  <p className="text-muted-foreground text-center py-4">Aucun rendez-vous à venir.</p>
                   <Button size="lg" className="w-full gap-2" asChild>
                    <Link href="/appointments">
                        <PlusCircle className="w-5 h-5" />
                        Ajouter un rendez-vous
                    </Link>
                  </Button>
                 </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
