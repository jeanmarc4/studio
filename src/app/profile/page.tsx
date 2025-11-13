'use client';

import { useRouter } from 'next/navigation';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/docs/backend-documentation';
import { User as UserIcon, Mail, Shield, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();

  // Redirect if user is not logged in
  if (!isUserLoading && !user) {
    router.push('/auth/login?redirect=/profile');
    return null; 
  }

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userProfileRef);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
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
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Mon Profil</CardTitle>
          <CardDescription>Consultez et mettez à jour vos informations personnelles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" value={userProfile.firstName} disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" value={userProfile.lastName} disabled />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={userProfile.email} disabled className="pl-10" />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={userProfile.role === 'Admin' ? 'secondary' : 'outline'}>
                        {userProfile.role}
                    </Badge>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button disabled>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder (bientôt disponible)
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
