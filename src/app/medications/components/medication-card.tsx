
'use client';

import { useState, useEffect } from 'react';
import { Pill, Clock, AlertCircle, Trash2, Edit, Bell, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Medication } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
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
import { explainMedication } from '@/ai/flows/explain-medication-flow';

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
}

export function MedicationCard({ medication, onEdit }: MedicationCardProps) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

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
  };

  const handleStandardReminder = () => {
    toast({
        title: `Rappel pour ${medication.name}`,
        description: `Il est l'heure de prendre votre ${medication.dosage}.`,
        duration: 5000,
    })
  }

  const handleExplainMedication = async () => {
     if (!isPremiumOrAdmin) {
        toast({
            variant: "destructive",
            title: "Fonctionnalité Premium",
            description: "Passez à Premium pour obtenir des explications par l'IA."
        })
        return;
    }
    setIsExplaining(true);
    try {
        const result = await explainMedication({ medicationName: medication.name });
        toast({
            title: `À propos de ${medication.name}`,
            description: result.explanation,
            duration: 10000 // Longer duration for reading
        })
    } catch (error) {
        console.error("Erreur lors de l'explication du médicament:", error);
        toast({
            variant: "destructive",
            title: "Erreur de l'IA",
            description: "Impossible de contacter le service d'IA pour le moment. Veuillez réessayer."
        })
    } finally {
        setIsExplaining(false);
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
      <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
        <div className="flex flex-col gap-2">
             <Button size="sm" variant="outline" onClick={handleExplainMedication} disabled={isExplaining || !isPremiumOrAdmin}>
                {isExplaining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Expliquer (IA)
            </Button>
            <Button size="sm" variant={"default"} onClick={handleStandardReminder}>
                <Bell className="mr-2 h-4 w-4" />
                Tester le rappel
            </Button>
        </div>
        <div className="flex flex-col justify-end items-end gap-2">
            <Button variant="outline" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Supprimer
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
