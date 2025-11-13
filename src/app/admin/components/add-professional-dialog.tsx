
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MedicalProfessional } from "@/docs/backend-documentation";

const professionalSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit comporter au moins 2 caractères." }),
  type: z.string().min(2, { message: "Le type est requis." }),
  specialty: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

interface AddProfessionalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onProfessionalAdd: (professional: Omit<MedicalProfessional, "id">) => void;
}

export function AddProfessionalDialog({ isOpen, onOpenChange, onProfessionalAdd }: AddProfessionalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof professionalSchema>>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      name: "",
      type: "Médecin",
      specialty: "",
      address: "",
      phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof professionalSchema>) {
    setIsLoading(true);
    // onProfessionalAdd(values); TODO: Implement
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    console.log("Adding professional:", values);
    setIsLoading(false);
    onOpenChange(false);
    form.reset();
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un professionnel</DialogTitle>
          <DialogDescription>
            Créez un nouveau profil pour un professionnel de la santé.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Marie Curie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Médecin">Médecin</SelectItem>
                      <SelectItem value="Pharmacie">Pharmacie</SelectItem>
                      <SelectItem value="Soins Holistiques">Soins Holistiques</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input placeholder="Cardiologie, Pédiatrie..." {...field} />
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
                    <Input placeholder="123 rue de la Santé, 75001 Paris" {...field} />
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
            <DialogFooter className="pt-4">
               <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  "Ajouter le profil"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
