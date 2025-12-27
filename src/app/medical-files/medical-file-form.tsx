'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase, useFirebaseApp } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import type { MedicalFile, Doctor } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  file: z.instanceof(File).refine(file => file.size > 0, 'Veuillez sélectionner un fichier.'),
  type: z.enum(['Ordonnance', 'Compte-rendu'], { required_error: 'Veuillez sélectionner un type.' }),
  doctorId: z.string().min(1, { message: 'Veuillez sélectionner un médecin.' }),
});

type MedicalFileFormValues = z.infer<typeof formSchema>;

interface MedicalFileFormProps {
  userId: string;
  onFormSubmit: () => void;
}

export function MedicalFileForm({ userId, onFormSubmit }: MedicalFileFormProps) {
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doctorsQuery = useMemoFirebase(() => collection(firestore, 'doctors'), [firestore]);
  const { data: doctors, isLoading: isLoadingDoctors } = useCollection<Doctor>(doctorsQuery);

  const form = useForm<MedicalFileFormValues>({
    resolver: zodResolver(formSchema)
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('file', file);
      // Manually trigger validation for the file input
      form.trigger('file');
    }
  };


  const onSubmit = async (data: MedicalFileFormValues) => {
    if (!userId || !data.file || !firebaseApp) return;
    setIsSubmitting(true);
    setUploadProgress(0);
    
    const doctor = doctors?.find(d => d.id === data.doctorId);
    if (!doctor) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Médecin non trouvé.' });
        setIsSubmitting(false);
        return;
    }

    try {
        const storage = getStorage(firebaseApp);
        const filePath = `users/${userId}/medicalFiles/${Date.now()}_${data.file.name}`;
        const storageRef = ref(storage, filePath);

        await uploadBytes(storageRef, data.file);
        setUploadProgress(50);
        
        const downloadUrl = await getDownloadURL(storageRef);
        setUploadProgress(100);


        const fileData: Omit<MedicalFile, 'id'> = { 
            userId,
            doctorId: data.doctorId,
            doctorName: doctor.name,
            fileName: data.file.name,
            type: data.type,
            url: downloadUrl,
            filePath: filePath,
            createdAt: Timestamp.now(),
        };

        const colRef = collection(firestore, `users/${userId}/medicalFiles`);
        addDocumentNonBlocking(colRef, fileData);
        toast({ title: "Succès", description: "Fichier téléversé et enregistré." });
        onFormSubmit();

    } catch (error) {
        console.error("File upload error:", error)
        toast({ variant: 'destructive', title: 'Erreur de téléversement', description: 'Impossible de téléverser le fichier. Vérifiez votre connexion et les permissions de stockage.' });
    } finally {
        setIsSubmitting(false);
        setUploadProgress(0);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Fichier</FormLabel>
                <FormControl>
                    <>
                        <Input
                            type="file"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,application/pdf"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start font-normal"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {field.value?.name || 'Sélectionner un fichier (PDF, Image)...'}
                        </Button>
                    </>
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
              <FormLabel>Type de document</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ordonnance">Ordonnance</SelectItem>
                  <SelectItem value="Compte-rendu">Compte-rendu</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associé au Dr.</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDoctors}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un médecin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors?.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isSubmitting && <Progress value={uploadProgress} className="w-full" />}
        
        <Button type="submit" disabled={isSubmitting || isLoadingDoctors} className="w-full">
            {(isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ajouter le fichier
        </Button>
      </form>
    </Form>
  );
}

    