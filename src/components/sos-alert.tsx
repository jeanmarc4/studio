"use client";

import { ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
import type { EmergencyContact } from "@/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useState } from "react";

export function SosAlert() {
    const { toast } = useToast();
    const { user, firestore } = useFirebase();
    const [isSending, setIsSending] = useState(false);

    const contactsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'emergencyContacts');
    }, [firestore, user]);
    
    const { data: contacts } = useCollection<EmergencyContact>(contactsQuery);

    const handleSosClick = async () => {
        if (!user || !firestore) return;
        if (!contacts || contacts.length === 0) {
            toast({
                variant: "destructive",
                title: "Aucun contact d'urgence",
                description: "Veuillez ajouter au moins un contact dans votre profil avant de lancer une alerte.",
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

        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Alerte SOS envoyée",
            description: "Vos contacts d'urgence ont été prévenus.",
            variant: "destructive",
        });
        setIsSending(false);
    }

    return (
        <Alert className="bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-center p-8">
            <AlertTitle className="text-2xl font-bold text-red-800 dark:text-red-200 flex items-center justify-center gap-2">
              <ShieldAlert className="h-8 w-8" />
              Urgence SOS
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300 mt-2 text-base">
              Cette action préviendra immédiatement vos contacts d'urgence.
            </AlertDescription>
            <Button 
                size="lg" 
                variant="destructive" 
                className="mt-6 text-lg font-bold py-6 px-10"
                onClick={handleSosClick}
                disabled={isSending}
            >
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ENVOYER L'ALERTE MAINTENANT
            </Button>
        </Alert>
    );
}
