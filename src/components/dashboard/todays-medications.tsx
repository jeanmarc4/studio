'use client';

import { useMemo } from 'react';
import { Pill, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Medication } from '@/types';
import { format, isToday } from 'date-fns';

interface TodaysMedicationsProps {
  medications: Medication[];
}

export function TodaysMedications({ medications }: TodaysMedicationsProps) {
  const router = useRouter();

  const todaysTakes = useMemo(() => {
    return medications
      .flatMap(med => med.intakeTimes.map(time => ({ ...med, takeTime: time })))
      .sort((a, b) => a.takeTime.localeCompare(b.takeTime));
  }, [medications]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Mes Prises du Jour</CardTitle>
        <CardDescription>Vos médicaments à prendre aujourd'hui.</CardDescription>
      </CardHeader>
      <CardContent>
        {todaysTakes.length > 0 ? (
          <ul className="space-y-4">
            {todaysTakes.map((med, index) => (
              <li key={`${med.id}-${index}`} className="p-3 bg-background rounded-lg border flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{med.name}</p>
                    <p className="text-sm text-muted-foreground">{med.dosage}</p>
                  </div>
                </div>
                <div className="flex items-center text-lg font-medium text-primary">
                  <Clock className="mr-2 h-5 w-5" />
                  <span>{med.takeTime}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            Aucune prise de médicament prévue pour aujourd'hui.
          </p>
        )}
        <Button className="w-full mt-6" variant="outline" onClick={() => router.push('/medications')}>
          Voir tout mon traitement
        </Button>
      </CardContent>
    </Card>
  );
}
