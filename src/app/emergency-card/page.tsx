
'use client';

import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { User, Medication, EmergencyContact } from '@/types';
import { Loader2, User as UserIcon, Droplets, Info, Pill, Phone, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function DataRow({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-4 py-3">
            <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold whitespace-pre-wrap">{value}</p>
            </div>
        </div>
    );
}

export default function EmergencyCardPage() {
    const { user, firestore, isUserLoading } = useFirebase();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/auth/login?redirect=/emergency-card');
        }
    }, [isUserLoading, user, router]);

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const medicationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'medications');
    }, [firestore, user]);

    const contactsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'users', user.uid, 'emergencyContacts');
    }, [firestore, user]);

    const { data: profile, isLoading: isProfileLoading } = useDoc<User>(userProfileRef);
    const { data: medications, isLoading: areMedicationsLoading } = useCollection<Medication>(medicationsQuery);
    const { data: contacts, isLoading: areContactsLoading } = useCollection<EmergencyContact>(contactsQuery);

    const isLoading = isUserLoading || isProfileLoading || areMedicationsLoading || areContactsLoading;

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Chargement de votre carte d'urgence...</p>
            </div>
        );
    }
    
    if (!profile) {
         return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
                <p className="text-destructive">Impossible de charger le profil.</p>
            </div>
        );
    }

    return (
        <div className="bg-red-50 dark:bg-gray-900 min-h-screen p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-headline text-red-600 dark:text-red-500 flex items-center justify-center gap-3">
                       <ShieldAlert className="h-10 w-10"/> CARTE D'URGENCE
                    </h1>
                </header>
                
                <Alert variant="destructive" className="mb-8">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Accès Hors Ligne</AlertTitle>
                    <AlertDescription>
                        Cette page est conçue pour être accessible même sans connexion internet. Gardez-la ouverte ou ajoutez-la à votre écran d'accueil pour un accès rapide.
                    </AlertDescription>
                </Alert>


                <div className="space-y-6">
                    <Card className="border-red-200 dark:border-red-800">
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">Identité</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <DataRow icon={UserIcon} label="Nom Complet" value={`${profile.firstName} ${profile.lastName}`} />
                            <DataRow icon={Droplets} label="Groupe Sanguin" value={profile.bloodType} />
                            <DataRow icon={Info} label="Allergies" value={profile.allergies} />
                            <DataRow icon={Info} label="Conditions Médicales" value={profile.medicalConditions} />
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">Traitements en Cours</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {medications && medications.length > 0 ? medications.map(med => (
                                <DataRow key={med.id} icon={Pill} label={med.name} value={`${med.dosage} - ${med.intakeTimes.join(', ')}`} />
                            )) : (
                                <p className="text-muted-foreground text-center py-4">Aucun traitement en cours.</p>
                            )}
                        </CardContent>
                    </Card>

                     <Card className="border-red-200 dark:border-red-800">
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">Contacts d'Urgence</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {contacts && contacts.length > 0 ? contacts.map(contact => (
                                <DataRow key={contact.id} icon={Phone} label={contact.name} value={contact.phone} />
                            )) : (
                                <p className="text-muted-foreground text-center py-4">Aucun contact d'urgence défini.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

    