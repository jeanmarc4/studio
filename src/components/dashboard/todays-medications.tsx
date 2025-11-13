
'use client';

import { useMemo, useState } from 'react';
import { Pill, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Medication, User } from '@/types';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface TodaysMedicationsProps {
  medications: Medication[];
}

export function TodaysMedications({ medications }: TodaysMedicationsProps) {
  const router = useRouter();
  const { user, firestore } = useFirebase();
  const [taken, setTaken] = useState<Set<string>>(new Set());

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: userProfile } = useDoc<User>(userProfileRef);

  const todaysTakes = useMemo(() => {
    return medications
      .flatMap(med => med.intakeTimes.map(time => ({ ...med, takeTime: time })))
      .sort((a, b) => a.takeTime.localeCompare(b.takeTime));
  }, [medications]);
  
  const handleMarkAsTaken = (medId: string, time: string) => {
    setTaken(prev => new Set(prev).add(`${medId}-${time}`));
  };

  const isFreePlan = userProfile?.role === 'Gratuit';

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Mes Prises du Jour</CardTitle>
        <CardDescription>
          {isFreePlan 
            ? "Confirmez manuellement chaque prise ci-dessous." 
            : "Vos rappels sont automatiques. Voici votre programme."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {todaysTakes.length > 0 ? (
          <ul className="space-y-4">
            {todaysTakes.map((med, index) => {
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
          Gérer tout mon traitement
        </Button>
      </CardContent>
    </Card>
  );
}
