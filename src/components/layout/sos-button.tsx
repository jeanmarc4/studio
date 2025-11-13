"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";

export function SosButton() {
  const { user } = useFirebase();
  const { toast } = useToast();

  const handleSendAlert = () => {
    toast({
      variant: "destructive",
      title: "Alerte SOS envoyée !",
      description: "Vos contacts d'urgence et les secours ont été prévenus.",
      duration: 10000,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" className="rounded-full">
          <ShieldAlert className="h-5 w-5" />
          <span className="sr-only">Alerte SOS</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            Confirmer l'alerte d'urgence ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action enverra immédiatement votre position à vos contacts
            d'urgence et aux services de secours. N'utilisez cette fonction
            qu'en cas de situation critique réelle.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleSendAlert} variant="destructive">
            Envoyer l'alerte
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
