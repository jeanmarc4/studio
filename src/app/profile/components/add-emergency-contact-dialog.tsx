
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
import type { EmergencyContact } from '@/docs/backend-documentation';
import { v4 as uuidv4 } from 'uuid';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères.'),
  phone: z.string().min(10, 'Le numéro de téléphone doit être valide.'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface AddEmergencyContactDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContactAdd: (values: ContactFormValues & { id: string }) => void;
}

export function AddEmergencyContactDialog({ isOpen, onOpenChange, onContactAdd }: AddEmergencyContactDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  const onSubmit = async (values: ContactFormValues) => {
    setIsLoading(true);
    
    const newContact = { ...values, id: uuidv4() };
    onContactAdd(newContact);

    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: 'Contact d\'urgence ajouté',
      description: `${values.name} a été ajouté à votre liste.`,
    });
    
    setIsLoading(false);
    handleDialogChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un contact d'urgence</DialogTitle>
          <DialogDescription>
            Cette personne sera notifiée si vous déclenchez une alerte SOS.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Marie Dubois" {...field} />
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
                  <FormLabel>Numéro de téléphone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="06 12 34 56 78" {...field} />
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
