
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { Stethoscope, Calendar, Loader2, Wand2, Pill, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Prescription } from '@/types';
import { Button } from '@/components/ui/button';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import type { User } from '@/docs/backend-documentation';
import { doc } from 'firebase/firestore';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { ExtractedMedication } from '@/ai/flows/extract-medications-flow';
import { useToast } from '@/hooks/use-toast';

interface PrescriptionCardProps {
  prescription: Prescription;
  onAnalyze: (prescription: Prescription) => Promise<void>;
  onAddMedication: (medication: ExtractedMedication) => void;
}

export function PrescriptionCard({ prescription, onAnalyze, onAddMedication }: PrescriptionCardProps) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<User>(userProfileRef);
  const isPremiumOrAdmin = userProfile?.role === 'Premium' || userProfile?.role === 'Admin';
  
  const getStatusVariant = (): 'secondary' | 'default' | 'destructive' | 'outline' => {
    switch (prescription.status) {
      case 'new': return 'default';
      case 'processing': return 'outline';
      case 'processed': return 'secondary';
      case 'error': return 'destructive';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusText = () => {
    switch (prescription.status) {
      case 'new': return 'Nouveau';
      case 'processing': return 'Analyse en cours...';
      case 'processed': return 'Analysé';
      case 'error': return 'Erreur';
      case 'archived': return 'Archivé';
      default: return prescription.status;
    }
  };
  
  const handleAddMedication = (med: ExtractedMedication) => {
    onAddMedication(med);
    toast({
      title: "Médicament ajouté",
      description: `${med.name} a été ajouté à votre traitement.`,
    });
  }
  
  const handleAnalysis = () => {
    if (!isPremiumOrAdmin) {
      toast({
        variant: "destructive",
        title: "Fonctionnalité Premium",
        description: "Passez à Premium pour analyser vos ordonnances."
      });
      return;
    }
    onAnalyze(prescription);
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Stethoscope className="mr-2 h-4 w-4" />
              <span>Prescrit par : {prescription.doctorName}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Date : {format(new Date(prescription.issueDate), 'd MMMM yyyy', { locale: fr })}</span>
            </div>
          </div>
          <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="relative h-64 w-full rounded-md border p-2">
            <Image src={prescription.imageUrl} alt="Ordonnance" layout="fill" objectFit="contain" />
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold">Médicaments extraits par IA</h3>
          {prescription.status === 'new' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Analyse requise</AlertTitle>
              <AlertDescription>
                {isPremiumOrAdmin 
                  ? "Cliquez sur 'Analyser avec l'IA' pour extraire automatiquement les médicaments de cette ordonnance."
                  : "Passez à Premium pour analyser automatiquement vos ordonnances."}
              </AlertDescription>
            </Alert>
          )}
          {prescription.status === 'processing' && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>L'IA analyse votre ordonnance...</span>
            </div>
          )}
          {prescription.status === 'processed' && prescription.extractedMedications && prescription.extractedMedications.length > 0 && (
            <div className="space-y-3">
              {prescription.extractedMedications.map((med, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg flex items-start justify-between">
                  <div>
                    <p className="font-bold flex items-center gap-2"><Pill className="h-4 w-4 text-primary" />{med.name}</p>
                    <p className="text-sm text-muted-foreground">Dosage: {med.dosage}</p>
                    {med.quantity && <p className="text-sm text-muted-foreground">Quantité: {med.quantity}</p>}
                    <p className="text-sm text-muted-foreground">Prises: {med.intakeTimes.join(', ')}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleAddMedication(med)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
                  </Button>
                </div>
              ))}
               <Alert variant="default" className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-300">Vérification</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-400">
                        Veuillez vérifier que les informations extraites par l'IA correspondent bien à votre ordonnance avant d'ajouter les médicaments.
                    </AlertDescription>
                </Alert>
            </div>
          )}
          {(prescription.status === 'processed' && (!prescription.extractedMedications || prescription.extractedMedications.length === 0)) && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Aucun médicament détecté</AlertTitle>
                <AlertDescription>
                    L'IA n'a pas pu détecter de médicaments sur cette image. Veuillez essayer avec une photo plus nette.
                </AlertDescription>
            </Alert>
          )}
           {prescription.status === 'error' && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur d'analyse</AlertTitle>
                <AlertDescription>
                    Une erreur est survenue. Veuillez réessayer plus tard ou avec une autre image.
                </AlertDescription>
            </Alert>
          )}

        </div>
      </CardContent>
       <CardFooter className="border-t pt-4">
          <Button 
            onClick={handleAnalysis}
            disabled={prescription.status === 'processing' || !isPremiumOrAdmin}
            className="w-full md:w-auto"
          >
            {prescription.status === 'processing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {prescription.status === 'processed' ? 'Ré-analyser avec l\'IA' : 'Analyser avec l\'IA'}
          </Button>
       </CardFooter>
    </Card>
  );
}
