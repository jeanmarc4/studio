
'use client';

import { useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UploadCloud, CalendarIcon } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';


const prescriptionSchema = z.object({
  doctorName: z.string().min(2, 'Le nom du médecin est requis.'),
  issueDate: z.date({ required_error: "La date d'émission est requise." }),
  imageFile: z.instanceof(File, { message: 'Veuillez sélectionner une image.' })
});

interface UploadPrescriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddPrescription: (values: { doctorName: string; issueDate: Date; imageUrl: string; }) => void;
}

export function UploadPrescriptionDialog({ isOpen, onOpenChange, onAddPrescription }: UploadPrescriptionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof prescriptionSchema>>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      doctorName: '',
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('imageFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
        form.reset();
        setImagePreview(null);
    }
    onOpenChange(open);
  }

  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const onSubmit = async (values: z.infer<typeof prescriptionSchema>) => {
    setIsLoading(true);
    
    try {
        const imageUrl = await convertFileToDataURL(values.imageFile);
        
        onAddPrescription({
            doctorName: values.doctorName,
            issueDate: values.issueDate,
            imageUrl: imageUrl
        });

        toast({
            title: 'Ordonnance ajoutée',
            description: "Votre ordonnance a été sauvegardée.",
        });

        setIsLoading(false);
        handleDialogChange(false);

    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Impossible de traiter l'image de l'ordonnance.",
        });
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une ordonnance</DialogTitle>
          <DialogDescription>
            Téléchargez une photo ou un scan de votre ordonnance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="doctorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du médecin</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date d'émission</FormLabel>
                   <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                            ) : (
                                <span>Choisissez une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageFile"
              render={() => (
                 <FormItem>
                    <FormLabel>Image de l'ordonnance</FormLabel>
                    <FormControl>
                        <div className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                            <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                             <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Aperçu de l'ordonnance" layout="fill" objectFit="contain" className="rounded-lg" />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                                        <p className="font-semibold">Cliquez pour télécharger</p>
                                        <p className="text-xs">PNG, JPG, ou WEBP</p>
                                    </div>
                                )}
                            </label>
                        </div>
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
