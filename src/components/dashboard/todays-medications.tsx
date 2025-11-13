
'use client';

import { useMemo, useState } from 'react';
import { Pill, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Medication, User } from '@/types';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useProfile } from '@/hooks/use-profile';
import { Skeleton } from '../ui/skeleton';


export function TodaysMedications() {
  const router = useRouter();
  const { user, firestore } = useFirebase();
  const { activeProfile } = useProfile();
  const [taken, setTaken] = useState<Set<string>>(new Set());

  const medicationsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !activeProfile) return null;
    return query(
        collection(firestore, 'users', user.uid, 'medications'),
        where('profileId', '==', activeProfile.id)
    );
  }, [firestore, user, activeProfile]);

  const { data: medications, isLoading: areMedicationsLoading } = useCollection<Medication>(medicationsQuery);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userProfileRef);

  const todaysTakes = useMemo(() => {
    if (!medications) return [];
    return medications
      .flatMap(med => med.intakeTimes.map(time => ({ ...med, takeTime: time })))
      .sort((a, b) => a.takeTime.localeCompare(b.takeTime));
  }, [medications]);
  
  const handleMarkAsTaken = (medId: string, time: string) => {
    setTaken(prev => new Set(prev).add(`${medId}-${time}`));
  };

  const isFreePlan = userProfile?.role === 'Gratuit';
  const isLoading = areMedicationsLoading || isProfileLoading;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-xl">
          Prises du Jour pour {activeProfile?.relationship === 'self' ? "Moi" : activeProfile?.name}
        </CardTitle>
        <CardDescription>
          {isFreePlan 
            ? "Confirmez manuellement chaque prise ci-dessous." 
            : `Le programme de ${activeProfile?.name} pour aujourd'hui. Les rappels sont gérés par l'IA.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : todaysTakes.length > 0 ? (
          <ul className="space-y-4">
            {todaysTakes.map((med) => {
              const takeId = `${med.id}-${med.takeTime}`;
              const isTaken = taken.has(takeId);
              return (
                 <li key={takeId} className="p-3 bg-background rounded-lg border flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-sm text-muted-foreground">{med.dosage}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-lg font-medium text-primary flex items-center">
                            <Clock className="mr-2 h-5 w-5" />
                            <span>{med.takeTime}</span>
                        </div>
                        {isFreePlan && (
                            <Button 
                                size="sm" 
                                variant={isTaken ? "secondary" : "default"}
                                onClick={() => handleMarkAsTaken(med.id, med.takeTime)}
                                disabled={isTaken}
                                className="w-24"
                            >
                                {isTaken ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
                                {isTaken ? 'Pris !' : 'Pris ?'}
                            </Button>
                        )}
                    </div>
                 </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            Aucune prise de médicament prévue pour aujourd'hui.
          </p>
        )}
        <Button className="w-full mt-6" variant="outline" onClick={() => router.push('/medications')}>
          Gérer tout le traitement
        </Button>
      </CardContent>
    </Card>
  );
}
