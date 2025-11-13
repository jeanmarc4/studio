"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { Appointment } from "@/docs/backend-documentation";
import type { PopulatedMedicalProfessional } from "@/types";

interface AppointmentDialogProps {
  doctor: PopulatedMedicalProfessional;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AppointmentDialog({
  doctor,
  isOpen,
  onOpenChange,
}: AppointmentDialogProps) {
  const { user, firestore } = useFirebase();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBooking = async () => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Non authentifié",
        description: "Vous devez être connecté pour prendre un rendez-vous.",
      });
      return;
    }

    if (!date || !time) {
      toast({
        variant: "destructive",
        title: "Informations incomplètes",
        description: "Veuillez sélectionner une date et une heure pour votre rendez-vous.",
      });
      return;
    }

    setIsLoading(true);

    const appointmentDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes);

    const newAppointment: Omit<Appointment, 'id'> = {
      userId: user.uid,
      medicalProfessionalId: doctor.id,
      dateTime: appointmentDateTime.toISOString(),
      reason: reason,
      status: "scheduled",
    };

    const appointmentsRef = collection(firestore, 'users', user.uid, 'appointments');
    addDocumentNonBlocking(appointmentsRef, newAppointment);
    
    setIsLoading(false);
    onOpenChange(false);
    toast({
      title: "Rendez-vous confirmé !",
      description: `Votre rendez-vous avec ${doctor.name} le ${format(
        date,
        "PPP",
        { locale: fr }
      )} à ${time} est confirmé.`,
    });

    // Reset form
    setDate(new Date());
    setTime("");
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prendre un rendez-vous</DialogTitle>
          <DialogDescription>
            Planifiez votre visite avec {doctor.name} ({doctor.specialty}).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal col-span-3",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Heure
            </Label>
            <Select onValueChange={setTime} value={time}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez un créneau horaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">09:00</SelectItem>
                <SelectItem value="10:00">10:00</SelectItem>
                <SelectItem value="11:00">11:00</SelectItem>
                <SelectItem value="14:00">14:00</SelectItem>
                <SelectItem value="15:00">15:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="reason" className="text-right pt-2">
              Motif
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optionnel : Décrivez brièvement le motif de votre visite."
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleBooking}
            disabled={isLoading}
            variant="default"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Réservation...
              </>
            ) : (
              "Confirmer la réservation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
