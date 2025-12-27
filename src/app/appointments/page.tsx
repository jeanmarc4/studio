'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Appointment } from '@/lib/types';
import { PlusCircle, Edit, Trash2, Calendar, Clock, Loader2, Stethoscope, Mic, Play, Pause } from 'lucide-react';
import { AppointmentForm } from './appointment-form';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { CardFooter } from '@/components/ui/card';


export default function AppointmentsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const appointmentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const apptCol = collection(firestore, `users/${user.uid}/appointments`);
    return query(apptCol, orderBy('dateTime', 'desc'));
  }, [firestore, user]);

  const { data: appointments, isLoading: isLoadingAppointments } = useCollection<Appointment>(appointmentsQuery);

  const handleEdit = (apt: Appointment) => {
    setAppointmentToEdit(apt);
    setIsFormOpen(true);
  };

  const handleDelete = (appointmentId: string) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/appointments`, appointmentId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Succès", description: "Rendez-vous supprimé." });
  };

  const openAddForm = () => {
    setAppointmentToEdit(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
  };

  const handlePlayMemo = (apt: Appointment) => {
    if (playingMemoId === apt.id) {
        audioRef.current?.pause();
        return; 
    } 
    
    if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
    }

    if (apt.voiceReminderMessage) {
        const audio = new Audio(apt.voiceReminderMessage);
        audioRef.current = audio;
        setPlayingMemoId(apt.id);
        audio.play();
        audio.onended = () => setPlayingMemoId(null);
        audio.onpause = () => setPlayingMemoId(null);
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);


  if (isUserLoading || isLoadingAppointments) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center">
        <p>Veuillez vous connecter pour gérer vos rendez-vous.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-foreground font-headline">
          Rendez-vous
        </h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={openAddForm}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Ajouter un rendez-vous
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{appointmentToEdit ? 'Modifier le' : 'Ajouter un'} rendez-vous</DialogTitle>
            </DialogHeader>
            <AppointmentForm 
              userId={user.uid}
              appointmentToEdit={appointmentToEdit} 
              onFormSubmit={handleFormSubmit} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {appointments && appointments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((apt) => {
            const aptDate = apt.dateTime.toDate();
            const isPast = aptDate < new Date();
            return (
            <Card key={apt.id} className={`flex flex-col ${isPast ? 'bg-muted/50' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                       <Stethoscope className="h-5 w-5 text-primary" />
                      {apt.doctorName}
                    </CardTitle>
                    <CardDescription>{apt.doctorSpecialty}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(apt)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible et supprimera définitivement ce rendez-vous.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(apt.id)} className="bg-destructive hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className={`capitalize ${isPast ? 'text-muted-foreground' : ''}`}>{format(aptDate, "EEEE d MMMM yyyy", { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={isPast ? 'text-muted-foreground' : ''}>{format(aptDate, "HH:mm", { locale: fr })}</span>
                </div>
              </CardContent>
              {apt.voiceReminderMessage && (
                <CardFooter>
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handlePlayMemo(apt)}>
                      {playingMemoId === apt.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {playingMemoId === apt.id ? "En cours..." : "Écouter le mémo"}
                    </Button>
                </CardFooter>
              )}
            </Card>
          )})}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Vous n'avez pas encore ajouté de rendez-vous.</p>
            <p className="text-muted-foreground">Cliquez sur "Ajouter un rendez-vous" pour commencer.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
