'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, query, orderBy, where, Timestamp, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { BloodGlucoseLog } from '@/lib/types';
import { Loader2, Droplets, Plus, Trash2 } from 'lucide-react';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, CartesianGrid, Area } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

const logSchema = z.object({
  glucoseLevel: z.coerce.number().min(20, 'Valeur trop basse').max(600, 'Valeur trop haute'),
  context: z.enum(['À jeun', 'Avant repas', 'Après repas', 'Au coucher']),
});

export default function DiabetesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const sevenDaysAgo = subDays(new Date(), 7);

  const logsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, `users/${user.uid}/glucoseLogs`), 
        where('measuredAt', '>=', sevenDaysAgo),
        orderBy('measuredAt', 'desc')
    );
  }, [firestore, user]);

  const { data: glucoseLogs, isLoading: isLoadingLogs } = useCollection<BloodGlucoseLog>(logsQuery);

  const form = useForm<z.infer<typeof logSchema>>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      glucoseLevel: 100,
      context: 'À jeun',
    },
  });

  const handleAddLog = (values: z.infer<typeof logSchema>) => {
    if (!user) return;
    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/glucoseLogs`), {
      userId: user.uid,
      glucoseLevel: values.glucoseLevel,
      context: values.context,
      measuredAt: Timestamp.now(),
    });
    toast({ title: 'Succès', description: 'Mesure de glycémie enregistrée.' });
    form.reset();
  };
  
  const handleDelete = (logId: string) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/glucoseLogs`, logId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Succès", description: "Mesure supprimée." });
  };
  
  const chartData = useMemo(() => {
    if (!glucoseLogs) return [];
    return glucoseLogs
        .map(log => ({
            name: format(log.measuredAt.toDate(), 'dd/MM HH:mm'),
            glucose: log.glucoseLevel,
        }))
        .reverse(); // reverse to show oldest to newest
  }, [glucoseLogs]);

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
          <Droplets className="w-10 h-10 text-blue-500" />
          <div>
            <h1 className="text-4xl font-bold text-foreground font-headline">
              Suivi du Diabète
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Enregistrez et visualisez vos mesures de glycémie.
            </p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Graphique de Glycémie (7 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 20', 'dataMax + 20']} unit=" mg/dL" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent indicator="dot" />} 
                />
                <Area type="monotone" dataKey="glucose" stroke="hsl(var(--primary))" fill="url(#colorGlucose)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">Pas assez de données pour afficher le graphique. Ajoutez une mesure pour commencer.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Nouvelle Mesure</CardTitle>
                    <CardDescription>Ajoutez une nouvelle valeur de glycémie.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddLog)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="glucoseLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Glycémie (mg/dL)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="context"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contexte</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un contexte" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="À jeun">À jeun</SelectItem>
                                                <SelectItem value="Avant repas">Avant repas</SelectItem>
                                                <SelectItem value="Après repas">Après repas</SelectItem>
                                                <SelectItem value="Au coucher">Au coucher</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                   {glucoseLogs && glucoseLogs.length > 0 ? (
                    <ul className="space-y-3">
                        {glucoseLogs.slice(0, 20).map((log) => (
                           <li key={log.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                     <div>
                                        <p className="font-bold text-lg text-primary">{log.glucoseLevel} <span className="text-sm font-normal text-muted-foreground">mg/dL</span></p>
                                        <p className="text-xs text-muted-foreground">{log.context}</p>
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
