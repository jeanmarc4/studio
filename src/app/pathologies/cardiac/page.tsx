'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, query, orderBy, where, Timestamp, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { BloodPressureLog } from '@/lib/types';
import { Loader2, HeartPulse, Plus, Trash2 } from 'lucide-react';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, CartesianGrid, Line, Legend } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

const logSchema = z.object({
  systolic: z.coerce.number().min(50, 'Valeur trop basse').max(300, 'Valeur trop haute'),
  diastolic: z.coerce.number().min(30, 'Valeur trop basse').max(200, 'Valeur trop haute'),
  pulse: z.coerce.number().min(30, 'Valeur trop basse').max(250, 'Valeur trop haute'),
});

export default function CardiacPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const thirtyDaysAgo = subDays(new Date(), 30);

  const logsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, `users/${user.uid}/bloodPressureLogs`), 
        where('measuredAt', '>=', thirtyDaysAgo),
        orderBy('measuredAt', 'desc')
    );
  }, [firestore, user]);

  const { data: pressureLogs, isLoading: isLoadingLogs } = useCollection<BloodPressureLog>(logsQuery);

  const form = useForm<z.infer<typeof logSchema>>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      systolic: 120,
      diastolic: 80,
      pulse: 70,
    },
  });

  const handleAddLog = (values: z.infer<typeof logSchema>) => {
    if (!user) return;
    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/bloodPressureLogs`), {
      userId: user.uid,
      ...values,
      measuredAt: Timestamp.now(),
    });
    toast({ title: 'Succès', description: 'Mesure de tension enregistrée.' });
    form.reset();
  };
  
  const handleDelete = (logId: string) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/bloodPressureLogs`, logId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Succès", description: "Mesure supprimée." });
  };
  
  const chartData = useMemo(() => {
    if (!pressureLogs) return [];
    return pressureLogs
        .map(log => ({
            name: format(log.measuredAt.toDate(), 'dd/MM'),
            Systolique: log.systolic,
            Diastolique: log.diastolic,
            Pouls: log.pulse,
        }))
        .reverse(); // reverse to show oldest to newest
  }, [pressureLogs]);

  const isLoading = isUserLoading || isLoadingLogs;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-4">
          <HeartPulse className="w-10 h-10 text-red-500" />
          <div>
            <h1 className="text-4xl font-bold text-foreground font-headline">
              Suivi Cardiaque
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Enregistrez et suivez votre tension et votre pouls.
            </p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Graphique de Tension (30 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 1 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent indicator="dot" />} 
                />
                <Legend />
                <Line type="monotone" dataKey="Systolique" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Diastolique" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                 <Line type="monotone" dataKey="Pouls" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">Pas assez de données pour afficher le graphique. Ajoutez au moins deux mesures.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Nouvelle Mesure</CardTitle>
                    <CardDescription>Ajoutez une nouvelle mesure de tension.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddLog)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="systolic"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Systolique (SYS)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="120" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="diastolic"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Diastolique (DIA)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="80" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="pulse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pouls (BPM)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="70" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                <Plus className="mr-2 h-4 w-4" /> Ajouter
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Historique des Mesures</CardTitle>
                     <CardDescription>Vos 20 dernières mesures enregistrées.</CardDescription>
                </CardHeader>
                <CardContent>
                   {pressureLogs && pressureLogs.length > 0 ? (
                    <ul className="space-y-3">
                        {pressureLogs.slice(0, 20).map((log) => (
                           <li key={log.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                     <div>
                                        <p className="font-bold text-lg text-primary">{log.systolic} / {log.diastolic} <span className="text-sm font-normal text-muted-foreground">mmHg</span></p>
                                        <p className="text-xs text-muted-foreground">Pouls: {log.pulse} bpm</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {format(log.measuredAt.toDate(), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                                    </p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Supprimer">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            Cette action est irréversible.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(log.id)} className="bg-destructive hover:bg-destructive/90">
                                            Supprimer
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                   ) : (
                    <p className="text-muted-foreground text-center py-10">Aucune mesure enregistrée pour l'instant.</p>
                   )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
