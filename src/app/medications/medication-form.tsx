'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFirestore } from '@/firebase';
import { doc, collection, serverTimestamp } from 'firebase/firestore';
import type { Medication } from '@/lib/types';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { X, Plus, Bot, Trash2, Loader2, Wand2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateVoiceReminder } from '@/lib/actions';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  dosage: z.string().min(1, { message: 'Le dosage est requis.' }),
  times: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:mm invalide")).min(1, 'Au moins une heure est requise.'),
  days: z.array(z.string()).min(1, 'Au moins un jour est requis.'),
  voiceReminderMessage: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof formSchema>;

interface MedicationFormProps {
  userId: string;
  medicationToEdit?: Medication | null;
  onFormSubmit: () => void;
}

const ALL_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];


export function MedicationForm({ userId, medicationToEdit, onFormSubmit }: MedicationFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      dosage: '',
      times: ['08:00'],
      days: [],
      voiceReminderMessage: '',
    },
  });

  const { fields: timeFields, append: appendTime, remove: removeTime } = useFieldArray({
    control: form.control,
    name: 'times',
  });

  useEffect(() => {
    if (medicationToEdit) {
      form.reset({
        name: medicationToEdit.name,
        dosage: medicationToEdit.dosage,
        times: medicationToEdit.times,
        days: medicationToEdit.days,
        voiceReminderMessage: medicationToEdit.voiceReminderMessage || '',
      });
    } else {
      form.reset({
        name: '',
        dosage: '',
        times: ['08:00'],
        days: [],
        voiceReminderMessage: '',
      });
    }
  }, [medicationToEdit, form]);

  const onSubmit = (data: MedicationFormValues) => {
    if (!userId) return;
    setIsSubmitting(true);

    const medData = { 
        ...data, 
        userId,
        createdAt: serverTimestamp(),
    };

    try {
      if (medicationToEdit) {
        const medRef = doc(firestore, `users/${userId}/medications`, medicationToEdit.id);
        // Exclude userId and createdAt on updates, as they should not change
        const { userId: _, createdAt: __, ...updateData } = medData;
        setDocumentNonBlocking(medRef, updateData, { merge: true });
        toast({ title: "Succès", description: "Médicament mis à jour." });
      } else {
        const medCol = collection(firestore, `users/${userId}/medications`);
        addDocumentNonBlocking(medCol, medData);
        toast({ title: "Succès", description: "Médicament ajouté." });
      }
      onFormSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGenerateMemo = async () => {
    const { name, dosage } = form.getValues();
    if (!name || !dosage) {
        toast({
            variant: "destructive",
            title: "Informations manquantes",
            description: "Veuillez renseigner le nom et le dosage du médicament.",
        });
        return;
    }

    setIsGeneratingMemo(true);
    const textToGenerate = `Il est l'heure de prendre votre médicament : ${name}, ${dosage}.`;
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du médicament</FormLabel>
              <FormControl>
                <Input placeholder="Lévothyroxine" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage</FormLabel>
              <FormControl>
                <Input placeholder="50mg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="days"
          render={({ field }) => (
            <FormItem>
                <div className="flex justify-between items-center">
                    <FormLabel>Jours de prise</FormLabel>
                    <Button type="button" variant="link" size="sm" className="p-0 h-auto" onClick={() => field.onChange(field.value.length === ALL_DAYS.length ? [] : ALL_DAYS)}>
                        {field.value.length === ALL_DAYS.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                    </Button>
                </div>
                <ToggleGroup type="multiple" variant="outline" className="flex-wrap justify-start" value={field.value} onValueChange={field.onChange}>
                    {ALL_DAYS.map(day => (
                        <ToggleGroupItem key={day} value={day} aria-label={`Toggle ${day}`}>
                            {day.slice(0,3)}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
                <FormMessage />
            </FormItem>
          )}
        />


        <div>
            <FormLabel>Heures de prise</FormLabel>
            <div className="space-y-2 mt-2">
                {timeFields.map((field, index) => (
                <FormField
                    key={field.id}
                    control={form.control}
                    name={`times.${index}`}
                    render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                        <FormControl>
                            <Input type="time" {...field} className="w-full"/>
                        </FormControl>
                         <Button type="button" variant="ghost" size="icon" onClick={() => removeTime(index)} disabled={timeFields.length <= 1}>
                            <X className="h-4 w-4 text-destructive" />
                        </Button>
                    </FormItem>
                    )}
                />
                ))}
                 <FormMessage>{form.formState.errors.times?.message || (form.formState.errors.times && form.formState.errors.times[0]?.message)}</FormMessage>

            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendTime('')}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter une heure
            </Button>
        </div>
        
        <FormItem>
          <FormLabel>Mémo vocal</FormLabel>
            <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleGenerateMemo} disabled={isGeneratingMemo}>
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
                Générez un rappel vocal automatique à partir du nom et du dosage.
            </FormDescription>
        </FormItem>

        <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {medicationToEdit ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </form>
    </Form>
  );
}

    