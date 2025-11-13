
'use client';

import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, User, Phone, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { EmergencyContact } from '@/docs/backend-documentation';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { AddEmergencyContactDialog } from './add-emergency-contact-dialog';
import { useToast } from '@/hooks/use-toast';

export function EmergencyContacts() {
  const { user, firestore } = useFirebase();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<EmergencyContact | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { toast } = useToast();

  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'emergencyContacts');
  }, [firestore, user]);

  const { data: contacts, isLoading } = useCollection<EmergencyContact>(contactsQuery);

  const handleAddContact = (newContact: { id: string; name: string; phone: string; }) => {
    if (!user || !firestore) return;
    const contactWithUserId = { ...newContact, userId: user.uid };
    const newDocRef = doc(firestore, 'users', user.uid, 'emergencyContacts', newContact.id);
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'emergencyContacts'), contactWithUserId);
  };
  
  const openDeleteDialog = (contact: EmergencyContact) => {
    setContactToDelete(contact);
    setIsDeleteAlertOpen(true);
  }

  const handleDeleteContact = () => {
    if (!user || !firestore || !contactToDelete) return;
    setIsDeleting(contactToDelete.id);
    const docRef = doc(firestore, 'users', user.uid, 'emergencyContacts', contactToDelete.id);
    deleteDocumentNonBlocking(docRef);
    
    // Optimistic UI update, hook will sync eventually
    setTimeout(() => {
        toast({
            title: 'Contact supprimé',
            description: `${contactToDelete.name} a été retiré de vos contacts d'urgence.`,
        });
        setIsDeleting(null);
        setContactToDelete(null);
        setIsDeleteAlertOpen(false);
    }, 500);
  };

  return (
    <>
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-2xl">Contacts d'Urgence</CardTitle>
            <CardDescription>Les personnes à prévenir en cas d'alerte SOS.</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
          ) : contacts && contacts.length > 0 ? (
            <ul className="space-y-3">
              {contacts.map((contact) => (
                <li key={contact.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-1">
                    <p className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {contact.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {contact.phone}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(contact)} disabled={isDeleting === contact.id}>
                    {isDeleting === contact.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              Vous n'avez pas encore ajouté de contact d'urgence.
            </p>
          )}
        </CardContent>
      </Card>
      
      <AddEmergencyContactDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onContactAdd={handleAddContact}
      />

       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce contact ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. <span className="font-semibold">{contactToDelete?.name}</span> ne sera plus notifié en cas d'urgence.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteContact} variant="destructive">
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
