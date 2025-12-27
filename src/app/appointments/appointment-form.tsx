'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, Timestamp } from 'firebase/firestore';
import type { Appointment, Doctor } from '@/lib/types';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, Wand2, Bot, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { handleGenerateVoiceReminder } from '@/lib/actions';

const formSchema = z.object({
  doctorId: z.string().min(1, { message: 'Veuillez sélectionner un médecin.' }),
  date: z.string().min(1, 'La date est requise.'),
  time: z.string().min(1, 'L\'heure est requise.'),
  reminder: z.string().min(1, { message: 'Veuillez sélectionner un rappel.' }),
  voiceReminderMessage: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof formSchema>;

interface AppointmentFormProps {
  userId: string;
  appointmentToEdit?: Appointment | null;
  onFormSubmit: () => void;
}

export function AppointmentForm({ userId, appointmentToEdit, onFormSubmit }: AppointmentFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);

  const doctorsQuery = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsQuery);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: '',
      date: '',
      time: '',
      reminder: '60',
      voiceReminderMessage: '',
    },
  });

  useEffect(() => {
    if (appointmentToEdit) {
      const appointmentDate = appointmentToEdit.dateTime.toDate();
      form.reset({
        doctorId: appointmentToEdit.doctorId,
        date: format(appointmentDate, 'yyyy-MM-dd'),
        time: format(appointmentDate, 'HH:mm'),
        reminder: appointmentToEdit.reminder || '60',
        voiceReminderMessage: appointmentToEdit.voiceReminderMessage || '',
      });
    } else {
      form.reset({
        doctorId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        reminder: '60',
        voiceReminderMessage: '',
      });
    }
  }, [appointmentToEdit, form]);

  const onSubmit = (data: AppointmentFormValues) => {
    if (!userId) return;
    setIsSubmitting(true);
    
    const doctor = doctors?.find(d => d.id === data.doctorId);
    if (!doctor) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Médecin non trouvé.'});
        setIsSubmitting(false);
        return;
    }

    const combinedDateTime = parse(`${data.date} ${data.time}`, 'yyyy-MM-dd HH:mm', new Date());

    const appointmentData: Omit<Appointment, 'id'> = { 
      userId,
      doctorId: data.doctorId,
      reminder: data.reminder,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      dateTime: Timestamp.fromDate(combinedDateTime),
      voiceReminderMessage: data.voiceReminderMessage,
    };

    try {
      if (appointmentToEdit) {
        const docRef = doc(firestore, `users/${userId}/appointments`, appointmentToEdit.id);
        const { userId: _, ...updateData } = appointmentData;
        setDocumentNonBlocking(docRef, updateData, { merge: true });
        toast({ title: "Succès", description: "Rendez-vous mis à jour." });
      } else {
        const colRef = collection(firestore, `users/${userId}/appointments`);
        addDocumentNonBlocking(colRef, appointmentData);
        toast({ title: "Succès", description: "Rendez-vous ajouté." });
      }
      onFormSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateMemo = async () => {
    const { doctorId, date, time } = form.getValues();
    const doctor = doctors?.find(d => d.id === doctorId);
    if (!doctor || !date || !time) {
        toast({
            variant: "destructive",
            title: "Informations manquantes",
            description: "Veuillez sélectionner un médecin et une date/heure.",
        });
        return;
    }
    
    setIsGeneratingMemo(true);
    const formattedDate = format(parse(date, 'yyyy-MM-dd', new Date()), "d MMMM yyyy", { locale: fr });
    const textToGenerate = `Rappel pour votre rendez-vous avec le Dr. ${doctor.name}, le ${formattedDate} à ${time}.`;
    
    const result = await handleGenerateVoiceReminder(textToGenerate);
    setIsGeneratingMemo(false);

    if (result.audioDataUri) {
        form.setValue('voiceReminderMessage', result.audioDataUri);
        toast({ title: "Mémo vocal généré", description: "Le mémo vocal a été créé et sauvegardé avec succès." });
    } else {
        toast({ variant: "destructive", title: "Erreur de génération", description: result.error || "Une erreur inconnue est survenue." });
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Médecin</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDoctors}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un médecin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors?.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="w-1/2">
                <FormLabel>Date</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
                <FormItem className="w-1/2">
                <FormLabel>Heure</FormLabel>
                <FormControl>
                    <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="reminder"
          render={({ field }) => (
             <FormItem>
              <FormLabel>Rappel</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Configurer un rappel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="30">30 minutes avant</SelectItem>
                  <SelectItem value="60">1 heure avant</SelectItem>
                  <SelectItem value="120">2 heures avant</SelectItem>
                  <SelectItem value="1440">24 heures avant</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Mémo vocal</FormLabel>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleGenerateMemo} disabled={isGeneratingMemo || !form.watch('doctorId') || !form.watch('date') || !form.watch('time')}>
                    {isGeneratingMemo ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Générer avec l'IA
                </Button>
                 {form.watch('voiceReminderMessage') && !isGeneratingMemo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Bot className="h-4 w-4 text-primary" />
                        <span>Mémo généré</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => form.setValue('voiceReminderMessage', '')}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                )}
            </div>
            <FormDescription>
                Générez un rappel vocal automatique pour ce rendez-vous.
            </FormDescription>
        </FormItem>
        
        <Button type="submit" disabled={isSubmitting || isLoadingDoctors} className="w-full">
            {(isSubmitting || isLoadingDoctors) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {appointmentToEdit ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </form>
    </Form>
  );
}
