'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Medication } from '@/lib/types';
import { PlusCircle, Pill, Clock, Calendar, Edit, Trash2, Mic, Play, Loader2, Pause } from 'lucide-react';
import { MedicationForm } from './medication-form';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MedicationsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | null>(null);
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const medicationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/medications`);
  }, [firestore, user]);

  const { data: medications, isLoading: isLoadingMedications } = useCollection<Medication>(medicationsQuery);

  const handleEdit = (med: Medication) => {
    setMedicationToEdit(med);
    setIsFormOpen(true);
  };

  const handleDelete = (medicationId: string) => {
    if (!user) return;
    const medRef = doc(firestore, `users/${user.uid}/medications`, medicationId);
    deleteDocumentNonBlocking(medRef);
    toast({ title: "Succès", description: "Médicament supprimé." });
  };

  const openAddForm = () => {
    setMedicationToEdit(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
  };
  
  const handlePlayMemo = (med: Medication) => {
    if (playingMemoId === med.id) {
        audioRef.current?.pause();
        return; // The onPause event will handle setting playingMemoId to null
    } 
    
    if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
    }

    if (med.voiceReminderMessage) {
        const audio = new Audio(med.voiceReminderMessage);
        audioRef.current = audio;
        setPlayingMemoId(med.id);
        audio.play();
        audio.onended = () => setPlayingMemoId(null);
        audio.onpause = () => setPlayingMemoId(null); // Ensure state is reset on pause
    }
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  if (isUserLoading || isLoadingMedications) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p>Veuillez vous connecter pour gérer vos médicaments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-foreground font-headline">
          Médicaments
        </h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={openAddForm}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Ajouter un médicament
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{medicationToEdit ? 'Modifier le' : 'Ajouter un'} médicament</DialogTitle>
            </DialogHeader>
            <MedicationForm 
              userId={user.uid}
              medicationToEdit={medicationToEdit} 
              onFormSubmit={handleFormSubmit} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {medications && medications.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {medications.map((med) => (
            <Card key={med.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      {med.name}
                    </CardTitle>
                    <CardDescription>{med.dosage}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(med)}>
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
                            Cette action est irréversible et supprimera définitivement ce médicament.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(med.id)} className="bg-destructive hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {med.times.map(time => (
                      <span key={time} className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                   <div className="flex flex-wrap gap-1">
                    {med.days.length === 7 ? (
                       <span className="text-muted-foreground">Tous les jours</span>
                    ) : daysOfWeek.map(day => (
                      <span key={day} className={cn("text-xs px-2 py-0.5 rounded-full", med.days.includes(day) ? 'bg-primary/20 text-primary-foreground' : 'text-muted-foreground')}>
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
                 {med.voiceReminderMessage && (
                  <div className="flex items-center gap-3 pt-2">
                    <Mic className="h-5 w-5 text-muted-foreground" />
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handlePlayMemo(med)}>
                      {playingMemoId === med.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {playingMemoId === med.id ? "En cours..." : "Écouter le mémo"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Vous n'avez pas encore ajouté de médicaments.</p>
            <p className="text-muted-foreground">Cliquez sur "Ajouter un médicament" pour commencer.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    