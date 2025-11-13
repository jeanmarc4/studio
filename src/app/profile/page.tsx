
'use client';

import { useRouter } from 'next/navigation';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, where, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, Medication, Appointment, Vaccine, EmergencyContact, FamilyProfile } from '@/types';
import { Mail, Shield, Save, Loader2, Phone, HeartPulse, Droplets, Info, Download } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { EmergencyContacts } from './components/emergency-contacts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { HealthRecordPDF } from './components/health-record-pdf';
import { useProfile } from '@/hooks/use-profile';

const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis."),
  lastName: z.string().min(2, "Le nom de famille est requis."),
  phone: z.string().optional(),
  role: z.enum(["Gratuit", "Standard", "Premium", "Admin"]),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const { activeProfile } = useProfile();

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [isUserLoading, user, router]);

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userProfileRef);
  
  const medicationsQuery = useMemoFirebase(() => (firestore && activeProfile) ? query(collection(firestore, 'users', user!.uid, 'medications'), where('profileId', '==', activeProfile.id)) : null, [firestore, user, activeProfile]);
  const appointmentsQuery = useMemoFirebase(() => (firestore && activeProfile) ? query(collection(firestore, 'users', user!.uid, 'appointments'), where('profileId', '==', activeProfile.id)) : null, [firestore, user, activeProfile]);
  const vaccinesQuery = useMemoFirebase(() => (firestore && activeProfile) ? query(collection(firestore, 'users', user!.uid, 'vaccines'), where('profileId', '==', activeProfile.id)) : null, [firestore, user, activeProfile]);
  const contactsQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'users', user.uid, 'emergencyContacts') : null, [firestore, user]);

  const { data: medications } = useCollection<Medication>(medicationsQuery);
  const { data: appointments } = useCollection<Appointment>(appointmentsQuery);
  const { data: vaccines } = useCollection<Vaccine>(vaccinesQuery);
  const { data: contacts } = useCollection<EmergencyContact>(contactsQuery);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      role: 'Gratuit',
      bloodType: '',
      allergies: '',
      medicalConditions: ''
    }
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone || '',
        role: userProfile.role,
        bloodType: userProfile.bloodType || '',
        allergies: userProfile.allergies || '',
        medicalConditions: userProfile.medicalConditions || '',
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user || !firestore) return;
    setIsSaving(true);
    
    const profileDocRef = doc(firestore, 'users', user.uid);
    updateDocumentNonBlocking(profileDocRef, data);

    const adminRoleDocRef = doc(firestore, 'roles_admin', user.uid);
    if (data.role === "Admin") {
        // Use blocking setDoc here for reliability when setting crucial roles
        try {
            await setDoc(adminRoleDocRef, { userId: user.uid, role: 'admin' });
        } catch (e) {
            console.error("Error setting admin role:", e);
        }
    } else {
        deleteDocumentNonBlocking(adminRoleDocRef);
    }
    
    await new Promise(resolve => setTimeout(resolve, 700));

    toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès."
    });
    setIsSaving(false);
  }

  const handleExport = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);

    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / pdfWidth;
    const finalHeight = canvasHeight / ratio;
    
    let heightLeft = finalHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save('Dossier-Sante-SanteConnect.pdf');
    setIsExporting(false);
  }

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
             <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
         <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                <CardTitle className="font-headline text-2xl">Mon Profil</CardTitle>
                <CardDescription>Consultez et mettez à jour vos informations personnelles et médicales.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2">Informations Personnelles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Adresse e-mail</Label>
                            <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="email" type="email" value={userProfile.email} disabled className="pl-10" />
                            </div>
                        </div>
                        <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                    <Input type="tel" placeholder="Non défini" {...field} className="pl-10"/>
                                </FormControl>
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </CardContent>
                <CardContent className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2">Informations Médicales d'Urgence</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <FormField
                            control={form.control}
                            name="bloodType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Groupe Sanguin</FormLabel>
                                <div className="relative">
                                     <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                     <FormControl>
                                        <Input placeholder="ex: A+, O-" {...field} className="pl-10"/>
                                    </FormControl>
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Allergies connues</FormLabel>
                             <FormControl>
                                <Textarea placeholder="ex: Pollen, Pénicilline, Arachides..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="medicalConditions"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Conditions médicales importantes</FormLabel>
                             <FormControl>
                                <Textarea placeholder="ex: Diabète de type 2, Asthme, Hypertension..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                 <CardContent className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2">Paramètres du Compte</h3>
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Abonnement</FormLabel>
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un rôle" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Gratuit">Gratuit</SelectItem>
                                    <SelectItem value="Standard">Standard</SelectItem>
                                    <SelectItem value="Premium">Premium</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                 </CardContent>
                <CardFooter className="flex justify-between">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sauvegarde...
                    </>
                    ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder les changements
                    </>
                    )}
                </Button>
                <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Exporter mon dossier
                </Button>
                </CardFooter>
            </Card>
          </form>
        </Form>

      <EmergencyContacts />

      {/* Hidden component for PDF generation */}
      <div className="absolute -z-10 -left-[9999px] top-0 w-[800px]">
        <div ref={pdfRef}>
            {userProfile && activeProfile && (
                <HealthRecordPDF 
                    user={userProfile}
                    profile={activeProfile}
                    medications={medications || []}
                    appointments={appointments || []}
                    vaccines={vaccines || []}
                    emergencyContacts={contacts || []}
                />
            )}
        </div>
      </div>
    </div>
  );
}
