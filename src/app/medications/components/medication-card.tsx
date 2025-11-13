
'use client';

import { useState } from 'react';
import { Pill, Clock, AlertCircle, Trash2, Edit, Bell, Loader2, Volume2, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Medication } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { User } from '@/docs/backend-documentation';
import { useDoc, useMemoFirebase } from '@/firebase/firestore/use-doc';
import { getVocalReminder } from '@/ai/flows/get-vocal-reminder-flow';

interface MedicationCardProps {
  medication: Medication;
}

export function MedicationCard({ medication }: MedicationCardProps) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVocalizing, setIsVocalizing] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<User>(userProfileRef);
  const isPremiumOrAdmin = userProfile?.role === 'Premium' || userProfile?.role === 'Admin';


  const handleDelete = () => {
    if (!user || !firestore) return;
    setIsDeleting(true);
    const medRef = doc(firestore, 'users', user.uid, 'medications', medication.id);
    deleteDocumentNonBlocking(medRef);
    toast({
      title: 'Médicament supprimé',
      description: `${medication.name} a été retiré de votre traitement.`,
    });
    // setIsDeleting is not set to false to let the component unmount naturally
  };

  const handleStandardReminder = () => {
    toast({
        title: `Rappel pour ${medication.name}`,
        description: `Il est l'heure de prendre votre ${medication.dosage}.`,
    })
  }

  const handlePremiumReminder = async () => {
    if (!isPremiumOrAdmin) {
        toast({
            variant: "destructive",
            title: "Fonctionnalité Premium",
            description: "Passez à Premium pour utiliser les rappels vocaux IA."
        })
        return;
    }
    setIsVocalizing(true);
    
    try {
      const response = await getVocalReminder({ medicationName: medication.name, dosage: medication.dosage });
      const audioSrc = response.audioUrl;
      const audio = new Audio(audioSrc);
      setAudio(audio);
      audio.play();

      toast({
          title: `Rappel vocal pour ${medication.name}`,
          description: `L'assistant IA joue le rappel...`,
      });

      audio.onended = () => {
        setIsVocalizing(false);
        setAudio(null);
      }

    } catch (error) {
       console.error("Erreur lors de la génération du rappel vocal :", error);
       toast({
           variant: "destructive",
           title: "Erreur de l'IA",
           description: "Impossible de générer le rappel vocal pour le moment.",
       });
       setIsVocalizing(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Pill className="text-primary" />
            {medication.name}
          </CardTitle>
          <Badge variant="secondary">{medication.dosage}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <span>Prises à : {medication.intakeTimes.join(', ')}</span>
        </div>
        {medication.quantity != null && (
            <div className={`flex items-center text-sm ${medication.quantity < 10 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Quantité restante : {medication.quantity}</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleStandardReminder}>
                <Bell className="mr-2 h-4 w-4" /> Test Standard
            </Button>
            <Button size="sm" variant={isPremiumOrAdmin ? "default" : "outline"} onClick={handlePremiumReminder} disabled={isVocalizing}>
                {isVocalizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (audio ? <PlayCircle className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />)}
                Test Premium
            </Button>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" disabled>
                <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. Le médicament {medication.name} sera définitivement supprimé.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} variant="destructive">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
