
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IdCard, Shield, UploadCloud, Edit, Trash2 } from 'lucide-react';
import type { CarteVitale, Mutuelle } from '@/types';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Input } from '@/components/ui/input';

interface CardManagementProps {
  type: 'vitale' | 'mutuelle';
  card?: CarteVitale | Mutuelle;
  onEdit: (type: 'vitale' | 'mutuelle', card: CarteVitale | Mutuelle) => void;
  onAdd: (values: { imageUrl: string, socialSecurityNumber?: string, insurerName?: string, policyNumber?: string }) => void;
}

export function CardManagement({ type, card, onEdit, onAdd }: CardManagementProps) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(card?.imageUrl || null);
  
  const title = type === 'vitale' ? 'Carte Vitale' : 'Carte de Mutuelle';
  const Icon = type === 'vitale' ? IdCard : Shield;

  const handleDelete = () => {
    if (!user || !firestore || !card) return;
    const collectionName = type === 'vitale' ? 'cartesVitale' : 'mutuelles';
    const docRef = doc(firestore, 'users', user.uid, collectionName, card.id);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Carte supprimée',
      description: `Votre ${title} a été supprimée.`,
    });
    setIsDeleteAlertOpen(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        // This is a simplified "add" flow. A real app might have a separate dialog.
        if (type === 'vitale') {
            onAdd({ imageUrl, socialSecurityNumber: 'N/A' });
        } else {
            onAdd({ imageUrl, insurerName: 'N/A', policyNumber: 'N/A' });
        }
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <Icon className="h-6 w-6 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {card ? (
          <div className="space-y-4">
             {card.imageUrl && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image src={card.imageUrl} alt={title} layout="fill" objectFit="contain" />
                </div>
             )}
            {type === 'vitale' && 'socialSecurityNumber' in card && (
              <div>
                <p className="text-sm font-semibold">Numéro de Sécurité Sociale</p>
                <p className="text-muted-foreground">{card.socialSecurityNumber}</p>
              </div>
            )}
            {type === 'mutuelle' && 'insurerName' in card && (
              <>
                <div>
                  <p className="text-sm font-semibold">Assureur</p>
                  <p className="text-muted-foreground">{card.insurerName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Numéro de Contrat</p>
                  <p className="text-muted-foreground">{card.policyNumber}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="relative flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
            <Input id={`${type}-file-upload`} type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
             <label htmlFor={`${type}-file-upload`} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                {imagePreview ? (
                    <Image src={imagePreview} alt="Aperçu" layout="fill" objectFit="contain" className="rounded-lg" />
                ) : (
                    <div className="text-center text-muted-foreground">
                        <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                        <p className="font-semibold">Cliquez pour télécharger</p>
                        <p className="text-xs">Ajoutez une image de votre carte</p>
                    </div>
                )}
            </label>
        </div>
        )}
      </CardContent>
      {card && (
        <CardFooter className="border-t pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onEdit(type, card)}>
            <Edit className="mr-2 h-4 w-4" /> Modifier
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteAlertOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>
        </CardFooter>
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les informations de votre {title} seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
