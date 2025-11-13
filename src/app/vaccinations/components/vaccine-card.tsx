
'use client';

import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Shield, Calendar, Bell, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Vaccine } from '@/types';
import { cn } from '@/lib/utils';

interface VaccineCardProps {
  vaccine: Vaccine;
}

export function VaccineCard({ vaccine }: VaccineCardProps) {
  const injectionDate = new Date(vaccine.date);
  const nextBoosterDate = vaccine.nextBooster ? new Date(vaccine.nextBooster) : null;
  
  const getBoosterStatus = () => {
    if (!nextBoosterDate) return null;

    const daysUntilBooster = differenceInDays(nextBoosterDate, new Date());

    if (daysUntilBooster < 0) {
      return { text: 'Rappel dépassé', variant: 'destructive' as const };
    }
    if (daysUntilBooster <= 90) {
      return { text: 'Rappel bientôt', variant: 'default' as const, className: 'bg-orange-500 text-white' };
    }
    return null;
  };

  const boosterStatus = getBoosterStatus();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Shield className="text-primary" />
            {vaccine.name}
          </CardTitle>
          {boosterStatus && (
             <Badge variant={boosterStatus.variant} className={cn(boosterStatus.className)}>
                {boosterStatus.text}
            </Badge>
          )}
        </div>
        <CardDescription>
          Injecté le {format(injectionDate, 'd MMMM yyyy', { locale: fr })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        {vaccine.lotNumber && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Package className="mr-2 h-4 w-4" />
            <span>Numéro de lot : {vaccine.lotNumber}</span>
          </div>
        )}
        {nextBoosterDate && (
          <div className="flex items-center text-sm font-semibold text-primary">
            <Bell className="mr-2 h-4 w-4" />
            <span>Prochain rappel le : {format(nextBoosterDate, 'd MMMM yyyy', { locale: fr })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    