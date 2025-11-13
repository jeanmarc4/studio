
'use client';

import { useState, useEffect } from 'react';
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
import type { Medication } from '@/types';

const medicationSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères.'),
  dosage: z.string().min(1, 'Le dosage est requis (ex: "1 comprimé", "500mg").'),
  quantity: z.coerce.number().positive('La quantité doit être un nombre positif.'),
  intakeTimes: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:mm).")).min(1, 'Au moins une heure de prise est requise.'),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

interface EditMedicationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  medication: Medication;
  onUpdate: (data: MedicationFormData) => void;
}

export function EditMedicationDialog({ isOpen, onOpenChange, medication, onUpdate }: EditMedicationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: medication.name,
      dosage: medication.dosage,
      quantity: medication.quantity,
      intakeTimes: medication.intakeTimes,
    },
  });
  
  useEffect(() => {
    form.reset(medication);
  }, [medication, form]);

  const intakeTimes = form.watch('intakeTimes');

  const handleAddTimeField = () => {
    form.setValue('intakeTimes', [...(intakeTimes || []), '']);
  }

  const handleRemoveTimeField = (index: number) => {
    form.setValue('intakeTimes', (intakeTimes || []).filter((_, i) => i !== index));
  }
  
  const handleDialogChange = (open: boolean) => {
    onOpenChange(open);
  }

  const onSubmit = async (values: MedicationFormData) => {
    setIsLoading(true);
    
    onUpdate(values);

    // Give a small delay for UI feedback as the update is non-blocking
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: 'Médicament mis à jour',
      description: `${values.name} a été mis à jour.`,
    });
    
    setIsLoading(false);
    handleDialogChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le médicament</DialogTitle>
          <DialogDescription>
            Mettez à jour les détails de votre médicament.
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
              <div className="space-y-2 mt-2">
                {intakeTimes?.map((_, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`intakeTimes.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        {(intakeTimes?.length ?? 0) > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTimeField(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddTimeField}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une heure
              </Button>
               <FormMessage>{form.formState.errors.intakeTimes?.message}</FormMessage>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>Annuler</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
