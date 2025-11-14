
'use client';

import { useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Medication } from '@/types';
import type { User } from '@/docs/backend-documentation';
import { useToast } from '@/hooks/use-toast';

// This component is now responsible for standard push/toast notifications.
export function GlobalReminderProvider({ children }: { children: React.ReactNode }) {
    const { user, firestore } = useFirebase();
    const { toast } = useToast();

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfile } = useDoc<User>(userProfileRef);

    const medicationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // In a real app, you might want to query across all profiles
        // For now, it will only remind for the main user's medications if profileId isn't checked
        return collection(firestore, 'users', user.uid, 'medications');
    }, [firestore, user]);
    const { data: medications } = useCollection<Medication>(medicationsQuery);

    useEffect(() => {
        // Only run for Standard and Premium users
        if (!medications || !userProfile || (userProfile.role !== 'Standard' && userProfile.role !== 'Premium')) {
            return;
        }

        const checkReminders = () => {
            const now = new Date();
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
                    // For both Standard and Premium, show a toast notification
                    toast({
                        title: `Rappel : ${med.name}`,
                        description: `Il est l'heure de prendre votre ${med.dosage}.`,
                        duration: 10000,
                    });
                }
            }
        };

        // Check every minute
        const intervalId = setInterval(checkReminders, 60000); // 60 * 1000 ms

        // Cleanup
        return () => clearInterval(intervalId);

    }, [medications, userProfile, toast]);

    return <>{children}</>;
}
