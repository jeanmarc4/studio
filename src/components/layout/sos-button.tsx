"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
import type { EmergencyContact } from "@/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SosButton() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'emergencyContacts');
  }, [firestore, user]);
  
  const { data: contacts } = useCollection<EmergencyContact>(contactsQuery);

  const handleSendAlert = async () => {
    if (!user || !firestore) return;
    if (!contacts || contacts.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucun contact d'urgence",
        description: "Veuillez ajouter au moins un contact d'urgence dans votre profil.",
      });
      return;
    }

    setIsSending(true);

    const alertData = {
      userId: user.uid,
      createdAt: new Date().toISOString(),
      contactsNotified: contacts.map(c => ({ name: c.name, phone: c.phone })),
    };

    const alertsRef = collection(firestore, 'sosAlerts');
    await addDocumentNonBlocking(alertsRef, alertData);

    // Simulate network delay for user feedback
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      variant: "destructive",
      title: "Alerte SOS envoyée !",
      description: "Vos contacts d'urgence ont été prévenus.",
      duration: 10000,
    });
    setIsSending(false);
  };

  if (!user) {
    return null;
  }

  return (
    <AlertDialog onOpenChange={(open) => !open && setIsSending(false)}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" className="rounded-full">
          <ShieldAlert className="h-5 w-5" />
          <span className="sr-only">Alerte SOS</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            Confirmer l'alerte d'urgence ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action enverra immédiatement une alerte à vos contacts d'urgence enregistrés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleSendAlert} variant="destructive" disabled={isSending}>
             {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Envoyer l'alerte
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
