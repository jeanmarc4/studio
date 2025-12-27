'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFirestore } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { Doctor } from '@/lib/types';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  specialty: z.string().min(2, { message: 'La spécialité est requise.' }),
  address: z.string().min(5, { message: "L'adresse est requise." }),
  phone: z.string().min(10, { message: 'Numéro de téléphone invalide.' }),
});

type DoctorFormValues = z.infer<typeof formSchema>;

interface DoctorFormProps {
  doctorToEdit?: Doctor | null;
  onFormSubmit: () => void;
}

export function DoctorForm({ doctorToEdit, onFormSubmit }: DoctorFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: doctorToEdit || {
      name: '',
      specialty: '',
      address: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (doctorToEdit) {
      form.reset(doctorToEdit);
    } else {
      form.reset({
        name: '',
        specialty: '',
        address: '',
        phone: '',
      });
    }
  }, [doctorToEdit, form]);

  const onSubmit = async (data: DoctorFormValues) => {
    setIsSubmitting(true);

    try {
      if (doctorToEdit) {
        const docRef = doc(firestore, 'doctors', doctorToEdit.id);
        setDocumentNonBlocking(docRef, data, { merge: true });
        toast({ title: "Succès", description: "Médecin mis à jour." });
      } else {
        const colRef = collection(firestore, 'doctors');
        await addDocumentNonBlocking(colRef, data);
        toast({ title: "Succès", description: "Médecin ajouté." });
      }
      onFormSubmit();
    } finally {
      setIsSubmitting(false);
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
              <FormLabel>Nom du médecin</FormLabel>
              <FormControl>
                <Input placeholder="Dr. Marie Dubois" {...field} />
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
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="123 Rue de la Santé, 75001 Paris" {...field} />
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
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="01 23 45 67 89" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {doctorToEdit ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </form>
    </Form>
  );
}
