
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CalendarIcon } from 'lucide-react';
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
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getDoc, DocumentReference } from 'firebase/firestore';
import type { MedicalProfessional, Appointment } from '@/docs/backend-documentation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useProfile } from '@/hooks/use-profile';
import { Textarea } from '@/components/ui/textarea';

const appointmentSchema = z.object({
  medicalProfessionalId: z.string().min(1, 'Veuillez sélectionner un médecin.'),
  dateTime: z.date({ required_error: 'La date et l\'heure sont requises.' }),
  reason: z.string().min(3, 'Le motif doit comporter au moins 3 caractères.'),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddAppointment: (values: { medicalProfessionalId: string; dateTime: Date; reason: string; }) => void;
}

export function AddAppointmentDialog({ isOpen, onOpenChange, onAddAppointment }: AddAppointmentDialogProps) {
  const { user, firestore } = useFirebase();
  const { activeProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<MedicalProfessional[]>([]);
  const { toast } = useToast();
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
  });
  
  // Fetch user's appointments to discover their doctors
  const appointmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'appointments');
  }, [firestore, user]);
  const { data: appointments } = useCollection<Appointment>(appointmentsQuery);

  // Fetch all professionals from the discovered IDs
  useEffect(() => {
    if (!appointments || !firestore) return;
    const fetchDoctors = async () => {
      const professionalIds = [...new Set(appointments.map(apt => apt.medicalProfessionalId))];
      const uniqueDoctors: MedicalProfessional[] = [];
      const fetchedIds = new Set();
      for (const id of professionalIds) {
        if (!id || fetchedIds.has(id)) continue;
        const profRef = doc(firestore, 'medicalProfessionals', id) as DocumentReference<MedicalProfessional>;
        const profSnap = await getDoc(profRef);
        if (profSnap.exists()) {
          uniqueDoctors.push(profSnap.data());
          fetchedIds.add(id);
        }
      }
      setDoctors(uniqueDoctors);
    };
    fetchDoctors();
  }, [appointments, firestore]);


  const handleDialogChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  const onSubmit = async (values: AppointmentFormValues) => {
    setIsLoading(true);
    
    onAddAppointment(values);

    // Give a small delay for feedback as Firestore update is non-blocking
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: 'Rendez-vous ajouté',
      description: `Votre rendez-vous pour ${activeProfile?.name} a été enregistré.`,
    });
    
    setIsLoading(false);
    handleDialogChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un rendez-vous</DialogTitle>
          <DialogDescription>
            Planifiez un nouveau rendez-vous pour <span className="font-bold">{activeProfile?.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="medicalProfessionalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professionnel de santé</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un professionnel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {doctors.length > 0 ? doctors.map(doc => (
                           <SelectItem key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</SelectItem>
                        )) : <p className="p-2 text-sm text-muted-foreground">Aucun médecin dans votre liste.</p>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date du rendez-vous</FormLabel>
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
                            disabled={(date) => date < new Date()}
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif de la consultation</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ex: Consultation annuelle, suivi, etc." {...field} />
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
