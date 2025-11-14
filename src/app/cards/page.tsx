
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { CarteVitale, Mutuelle } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useProfile } from '@/hooks/use-profile';
import { CardManagement } from './components/card-management';
import { EditCardDialog } from './components/edit-card-dialog';

export default function CardsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<{ type: 'vitale' | 'mutuelle'; data: CarteVitale | Mutuelle } | null>(null);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect=/cards');
    }
  }, [isUserLoading, user, router]);

  const carteVitaleQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'cartesVitale');
  }, [firestore, user]);

  const mutuellesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'mutuelles');
  }, [firestore, user]);

  const { data: cartesVitale, isLoading: areCartesVitaleLoading } = useCollection<CarteVitale>(carteVitaleQuery);
  const { data: mutuelles, isLoading: areMutuellesLoading } = useCollection<Mutuelle>(mutuellesQuery);

  const carteVitale = cartesVitale?.[0]; // Assuming only one Carte Vitale

  const handleEditClick = (type: 'vitale' | 'mutuelle', data: CarteVitale | Mutuelle) => {
    setCardToEdit({ type, data });
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateCard = (values: Partial<CarteVitale | Mutuelle>) => {
    if (!user || !firestore || !cardToEdit) return;

    const collectionName = cardToEdit.type === 'vitale' ? 'cartesVitale' : 'mutuelles';
    const cardRef = doc(firestore, 'users', user.uid, collectionName, cardToEdit.data.id);
    
    updateDocumentNonBlocking(cardRef, values);
  };
  
  const handleAddCard = (type: 'vitale' | 'mutuelle', values: { imageUrl: string, socialSecurityNumber?: string, insurerName?: string, policyNumber?: string }) => {
    if (!user || !firestore) return;
    
    const collectionName = type === 'vitale' ? 'cartesVitale' : 'mutuelles';
    const cardData = {
        userId: user.uid,
        ...values
    };
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, collectionName), cardData);
  }

  const isLoading = isUserLoading || areCartesVitaleLoading || areMutuellesLoading;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
            Mes Cartes de Santé
          </h1>
          <p className="mt-2 text-lg text-muted-foreground font-body">
            Gardez votre carte Vitale et votre carte de mutuelle à portée de main.
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            <CardManagement
              type="vitale"
              card={carteVitale}
              onEdit={handleEditClick}
              onAdd={(values) => handleAddCard('vitale', values)}
            />
             <CardManagement
              type="mutuelle"
              card={mutuelles?.[0]} // Simple example, first mutuelle
              onEdit={handleEditClick}
              onAdd={(values) => handleAddCard('mutuelle', values)}
            />
          </div>
        )}
      </div>

      {cardToEdit && (
        <EditCardDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          cardInfo={cardToEdit}
          onUpdate={handleUpdateCard}
        />
      )}
    </>
  );
}
