'use client';

import { useState } from 'react';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Doctor } from '@/lib/types';
import { PlusCircle, Edit, Trash2, Phone, MapPin, Loader2 } from 'lucide-react';
import { UserMd } from '@/components/icons';
import { DoctorForm } from './doctor-form';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function DoctorsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);

  const doctorsQuery = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const { data: doctors, isLoading, error } = useCollection<Doctor>(doctorsQuery);

  const handleEdit = (doc: Doctor) => {
    setDoctorToEdit(doc);
    setIsFormOpen(true);
  };

  const handleDelete = (doctorId: string) => {
    const docRef = doc(firestore, 'doctors', doctorId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Succès", description: "Médecin supprimé." });
  };

  const openAddForm = () => {
    setDoctorToEdit(null);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = () => {
      setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
      // This is a basic error display. In a real app, you might want a more user-friendly error screen.
      return <div className="text-center text-destructive">Erreur: Impossible de charger les médecins. Veuillez vérifier vos permissions Firestore.</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-foreground font-headline">
          Médecins
        </h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={openAddForm}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Ajouter un médecin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{doctorToEdit ? 'Modifier le' : 'Ajouter un'} médecin</DialogTitle>
            </DialogHeader>
            <DoctorForm 
              doctorToEdit={doctorToEdit} 
              onFormSubmit={handleFormSubmit} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {doctors && doctors.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserMd className="h-5 w-5 text-primary" />
                      {doctor.name}
                    </CardTitle>
                    <CardDescription>{doctor.specialty}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(doctor)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible et supprimera définitivement ce médecin.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(doctor.id)} className="bg-destructive hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{doctor.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{doctor.phone}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Vous n'avez pas encore ajouté de médecins.</p>
            <p className="text-muted-foreground">Cliquez sur "Ajouter un médecin" pour commencer.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
