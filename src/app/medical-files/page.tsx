'use client';

import { useState } from 'react';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCollection, useFirestore, useUser, useMemoFirebase, useFirebaseApp } from '@/firebase';
import type { MedicalFile } from '@/lib/types';
import { PlusCircle, Loader2, FileText, Trash2, Download } from 'lucide-react';
import { MedicalFileForm } from './medical-file-form';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getStorage, ref, deleteObject } from "firebase/storage";

export default function MedicalFilesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/medicalFiles`), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: medicalFiles, isLoading: isLoadingFiles } = useCollection<MedicalFile>(filesQuery);

  const handleDelete = (file: MedicalFile) => {
    if (!user || !firebaseApp) return;
    
    // Ensure the file has a filePath, which is crucial for deletion.
    if (!file.filePath) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Le chemin du fichier est manquant, impossible de supprimer.' });
        // As a fallback, try to delete the Firestore document anyway.
        const docRef = doc(firestore, `users/${user.uid}/medicalFiles`, file.id);
        deleteDocumentNonBlocking(docRef);
        return;
    }
    
    const storage = getStorage(firebaseApp);
    const fileRef = ref(storage, file.filePath);

    // Delete the file from Firebase Storage
    deleteObject(fileRef).then(() => {
        // After successful deletion from storage, delete the document from Firestore.
        const docRef = doc(firestore, `users/${user.uid}/medicalFiles`, file.id);
        deleteDocumentNonBlocking(docRef);
        toast({ title: "Succès", description: "Fichier supprimé." });
    }).catch((error) => {
        console.error("Error removing file: ", error);
        // If the file doesn't exist in storage, but the DB entry exists, still delete the DB entry.
        if (error.code === 'storage/object-not-found') {
            const docRef = doc(firestore, `users/${user.uid}/medicalFiles`, file.id);
            deleteDocumentNonBlocking(docRef);
            toast({ variant: 'default', title: 'Nettoyage terminé', description: 'Le fichier n\'existait pas dans le stockage, mais la référence a été supprimée.' });
        } else {
            toast({ variant: 'destructive', title: 'Erreur de suppression', description: 'Impossible de supprimer le fichier du stockage. Veuillez réessayer.' });
        }
    });
  };


  const handleFormSubmit = () => {
    setIsFormOpen(false);
  };
  
  const ordonnances = medicalFiles?.filter(f => f.type === 'Ordonnance') || [];
  const comptesRendus = medicalFiles?.filter(f => f.type === 'Compte-rendu') || [];

  const isLoading = isUserLoading || isLoadingFiles;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center">
        <p>Veuillez vous connecter pour gérer vos fichiers médicaux.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-foreground font-headline">
          Fichiers Médicaux
        </h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Ajouter un fichier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un fichier médical</DialogTitle>
            </DialogHeader>
            <MedicalFileForm 
              userId={user.uid}
              onFormSubmit={handleFormSubmit} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Ordonnances</CardTitle>
                <CardDescription>Vos prescriptions médicales.</CardDescription>
            </CardHeader>
            <CardContent>
                {ordonnances.length > 0 ? (
                    <ul className="space-y-3">
                        {ordonnances.map(file => <FileItem key={file.id} file={file} onDelete={handleDelete} />)}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm py-4 text-center">Aucune ordonnance.</p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Comptes-rendus</CardTitle>
                <CardDescription>Vos comptes-rendus de consultation ou d'examen.</CardDescription>
            </CardHeader>
            <CardContent>
                {comptesRendus.length > 0 ? (
                     <ul className="space-y-3">
                        {comptesRendus.map(file => <FileItem key={file.id} file={file} onDelete={handleDelete} />)}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm py-4 text-center">Aucun compte-rendu.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


interface FileItemProps {
    file: MedicalFile;
    onDelete: (file: MedicalFile) => void;
}

function FileItem({ file, onDelete }: FileItemProps) {
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = () => {
       if (!file.url) {
           toast({ variant: 'destructive', title: 'Erreur', description: 'Ce fichier n\'a pas d\'URL de téléchargement valide.'});
           return;
       }
       setIsDownloading(true);
       // Directly open the download URL in a new tab
       window.open(file.url, '_blank');
       // We can't know for sure when the download starts/finishes
       // so we'll just reset the state after a short delay.
       setTimeout(() => setIsDownloading(false), 1000);
    }

    return (
        <li className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-foreground truncate" title={file.fileName}>{file.fileName}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                        {file.createdAt ? format(file.createdAt.toDate(), "d MMM yyyy", { locale: fr }) : 'Date inconnue'} - Dr. {file.doctorName}
                    </p>
                </div>
            </div>
            <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={handleDownload} disabled={isDownloading} title="Télécharger">
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                        Cette action est irréversible et supprimera définitivement le fichier de vos archives.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(file)} className="bg-destructive hover:bg-destructive/90">
                        Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </li>
    );
}
    
    