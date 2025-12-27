'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useDoc } from '@/firebase/firestore/use-doc';

// Server Action pour appeler le flow unifié
async function triggerRemindersCheck() {
  try {
    const response = await fetch('/api/flows/sendRemindersFlow', { method: 'POST' });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erreur du serveur: ${response.status} ${errorBody}`);
    }
    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Erreur lors de l'appel du flow:", error);
    return { success: false, error: (error as Error).message };
  }
}

export default function AdminDebugPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<User>(userDocRef);
  const isAdmin = userData?.role === 'admin';

  const handleTrigger = async () => {
    setIsLoading(true);
    toast({ title: 'Déclenchement...', description: 'Lancement de la vérification des notifications...' });
    const result = await triggerRemindersCheck();
    setIsLoading(false);

    if (result.success && result.data.success) {
      toast({
        title: 'Vérification terminée',
        description: `Flow exécuté. Notifications: ${result.data.welcomeSent || 0} bienvenue, ${result.data.appointmentsSent || 0} rdv, ${result.data.medicationsSent || 0} médocs.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error || result.data.error || "Une erreur inconnue est survenue.",
      });
    }
  };

  if (isUserLoading || isUserDataLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!isAdmin) {
    return <div className="text-center text-destructive">Accès refusé.</div>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold font-headline">Outils de Débogage Admin</h1>
        <p className="text-lg text-muted-foreground mt-1">Actions réservées à l'administration pour le test.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Test des Notifications</CardTitle>
          <CardDescription>
            Cette action déclenche manuellement le flow unifié qui envoie toutes les notifications :
            bienvenue, rappels de rendez-vous et rappels de médicaments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTrigger} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Lancer le test de toutes les notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
