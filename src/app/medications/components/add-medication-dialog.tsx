
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const medicationSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères.'),
  dosage: z.string().min(1, 'Le dosage est requis (ex: "1 comprimé", "500mg").'),
  quantity: z.coerce.number().positive('La quantité doit être un nombre positif.'),
  intakeTimes: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:mm).")).min(1, 'Au moins une heure de prise est requise.'),
});

interface AddMedicationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddMedicationDialog({ isOpen, onOpenChange }: AddMedicationDialogProps) {
  const { user, firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [timeFields, setTimeFields] = useState(['']);

  const form = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      dosage: '',
      quantity: 1,
      intakeTimes: [''],
    },
  });

  const handleAddTimeField = () => {
    const newTimeFields = [...form.getValues('intakeTimes'), ''];
    form.setValue('intakeTimes', newTimeFields);
    setTimeFields(newTimeFields);
  }

  const handleRemoveTimeField = (index: number) => {
    const newTimeFields = form.getValues('intakeTimes').filter((_, i) => i !== index);
    form.setValue('intakeTimes', newTimeFields);
    setTimeFields(newTimeFields);
  }

  const onSubmit = async (values: z.infer<typeof medicationSchema>) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    setIsLoading(true);

    const newMedication = {
      userId: user.uid,
      ...values,
    };
    
    const medicationsRef = collection(firestore, 'users', user.uid, 'medications');
    addDocumentNonBlocking(medicationsRef, newMedication);

    toast({
      title: 'Médicament ajouté',
      description: `${values.name} a été ajouté à votre traitement.`,
    });
    
    setIsLoading(false);
    onOpenChange(false);
    form.reset();
    setTimeFields(['']);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un médicament</DialogTitle>
          <DialogDescription>
            Remplissez les détails de votre nouveau médicament.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du médicament</FormLabel>
                  <FormControl>
                    <Input placeholder="Paracétamol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="1 comprimé" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité totale</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel>Heures de prise</FormLabel>
              {form.getValues('intakeTimes').map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`intakeTimes.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 mt-2">
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      {form.getValues('intakeTimes').length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTimeField(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddTimeField}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une heure
              </Button>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
