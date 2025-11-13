
'use client';

import { useEffect, useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Medication } from '@/types';
import type { User } from '@/docs/backend-documentation';
import { useToast } from '@/hooks/use-toast';
import { getVocalReminder } from '@/ai/flows/get-vocal-reminder-flow';

// Ce composant ne rend rien, il gère la logique de rappel en arrière-plan
export function GlobalReminderProvider({ children }: { children: React.ReactNode }) {
    const { user, firestore } = useFirebase();
    const { toast } = useToast();
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfile } = useDoc<User>(userProfileRef);

    const medicationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'medications');
    }, [firestore, user]);
    const { data: medications } = useCollection<Medication>(medicationsQuery);

    useEffect(() => {
        if (!medications || !userProfile) return;

        const checkReminders = async () => {
            const now = new Date();
            // Force the timezone to Europe/Paris
            const options: Intl.DateTimeFormatOptions = {
                timeZone: 'Europe/Paris',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            };
            const formatter = new Intl.DateTimeFormat('fr-FR', options);
            const currentTime = formatter.format(now);
            
            for (const med of medications) {
                if (med.intakeTimes.includes(currentTime)) {
                    // C'est l'heure de prendre ce médicament
                    const isPremiumOrAdmin = userProfile.role === 'Premium' || userProfile.role === 'Admin';
                    const isStandard = userProfile.role === 'Standard';
                    
                    if (isPremiumOrAdmin) {
                        // Logique Premium : rappel vocal
                        try {
                            const response = await getVocalReminder({ medicationName: med.name, dosage: med.dosage });
                            const audioSrc = response.audioUrl;
                            const newAudio = new Audio(audioSrc);
                            newAudio.play();
                            toast({
                                title: `Rappel vocal pour ${med.name}`,
                                description: `L'assistant IA joue votre rappel.`,
                            });
                        } catch (error) {
                            console.error("Erreur du rappel vocal, fallback en standard:", error);
                            // Fallback sur un rappel standard si l'IA échoue
                            toast({
                                title: `Rappel : ${med.name}`,
                                description: `Il est l'heure de prendre votre ${med.dosage}.`,
                                duration: 10000,
                            });
                        }
                    } else if (isStandard) {
                        // Logique Standard : notification
                        toast({
                            title: `Rappel : ${med.name}`,
                            description: `Il est l'heure de prendre votre ${med.dosage}.`,
                            duration: 10000,
                        });
                    }
                }
            }
        };

        // Vérifier toutes les minutes
        const intervalId = setInterval(checkReminders, 60000); // 60 * 1000 ms

        // Nettoyage à la désinscription
        return () => clearInterval(intervalId);

    }, [medications, userProfile, toast]);

    return <>{children}</>;
}
