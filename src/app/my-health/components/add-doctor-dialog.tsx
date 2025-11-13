
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
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

const doctorSchema = z.object({
  name: z.string().min(2, 'Le nom est requis.'),
  specialty: z.string().min(2, 'La spécialité est requise.'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

interface AddDoctorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddDoctor: (values: DoctorFormValues) => void;
}

export function AddDoctorDialog({ isOpen, onOpenChange, onAddDoctor }: AddDoctorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialty: '',
      address: '',
      phone: '',
    },
  });

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  const onSubmit = async (values: DoctorFormValues) => {
    setIsLoading(true);
    
    onAddDoctor(values);

    // Give a small delay for feedback, as Firestore update is non-blocking
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: 'Médecin ajouté',
      description: `${values.name} a été ajouté à votre liste de médecins.`,
    });
    
    setIsLoading(false);
    handleDialogChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un médecin</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau professionnel de santé à votre liste personnelle.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du médecin</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Marie Curie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spécialité</FormLabel>
                  <FormControl>
                    <Input placeholder="Cardiologue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse (Optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Rue de la Santé, Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone (Optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="01 23 45 67 89" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>Annuler</Button>
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
