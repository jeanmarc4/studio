
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UploadCloud } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { CarteVitale, Mutuelle } from '@/types';
import Image from 'next/image';

const vitaleSchema = z.object({
  socialSecurityNumber: z.string().min(1, 'Le numéro est requis.'),
  imageUrl: z.string().url('URL invalide'),
});

const mutuelleSchema = z.object({
  insurerName: z.string().min(1, "Le nom de l'assureur est requis."),
  policyNumber: z.string().min(1, 'Le numéro de contrat est requis.'),
  imageUrl: z.string().url('URL invalide'),
});

const formSchema = z.union([vitaleSchema, mutuelleSchema]);
type FormValues = z.infer<typeof formSchema>;

interface EditCardDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cardInfo: { type: 'vitale' | 'mutuelle'; data: CarteVitale | Mutuelle };
  onUpdate: (values: Partial<CarteVitale | Mutuelle>) => void;
}

export function EditCardDialog({ isOpen, onOpenChange, cardInfo, onUpdate }: EditCardDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(cardInfo.data.imageUrl);
  const { toast } = useToast();

  const currentSchema = cardInfo.type === 'vitale' ? vitaleSchema : mutuelleSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(currentSchema),
  });

  useEffect(() => {
    if (cardInfo.data) {
        setImagePreview(cardInfo.data.imageUrl);
        form.reset({
            ...cardInfo.data
        });
    }
  }, [cardInfo, form]);
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setImagePreview(url);
        form.setValue('imageUrl', url);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    onUpdate(values);

    // Delay for optimistic UI feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: 'Carte mise à jour',
      description: `Les informations ont été sauvegardées.`,
    });
    
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier ma {cardInfo.type === 'vitale' ? 'Carte Vitale' : 'Mutuelle'}</DialogTitle>
          <DialogDescription>Mettez à jour les informations ci-dessous.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {cardInfo.type === 'vitale' && (
              <FormField
                control={form.control}
                name="socialSecurityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de Sécurité Sociale</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {cardInfo.type === 'mutuelle' && (
              <>
                <FormField
                  control={form.control}
                  name="insurerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'assureur</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="policyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de contrat</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

             <FormItem>
                <FormLabel>Image de la carte</FormLabel>
                <FormControl>
                    <div className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <Input id="file-upload-edit" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                            <label htmlFor="file-upload-edit" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Aperçu" layout="fill" objectFit="contain" className="rounded-lg" />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                                    <p className="font-semibold">Changer l'image</p>
                                </div>
                            )}
                        </label>
                    </div>
                </FormControl>
                <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>
            </FormItem>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
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
