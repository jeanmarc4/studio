
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GoogleIcon } from '@/components/icons';

const formSchema = z.object({
  email: z.string().email({ message: 'Veuillez entrer une adresse e-mail valide.' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' }),
  name: z.string().optional(),
});

type AuthFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan');

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  useEffect(() => {
    if (selectedPlan) {
      setIsLogin(false);
    }
  }, [selectedPlan]);
  
  const handleUserCreation = async (user: import('firebase/auth').User, isNewUser = false) => {
    const userDocRef = doc(firestore, 'users', user.uid);
    const isAdmin = user.email === 'diojm93@gmail.com' || user.email === 'admin@jmdigitalapp.com';

    // Construct the user data object.
    const userData: Partial<User> = {
      id: user.uid,
      email: user.email,
      role: isAdmin ? 'admin' : 'patient',
    };

    // If it's a new user, set the subscription plan and validation status.
    if (isNewUser) {
      userData.subscriptionPlan = (selectedPlan as User['subscriptionPlan']) || 'Gratuit';
      userData.validated = false; // Set validated to false for new users
    }

    try {
      // Use setDoc with merge:true to create or update the document.
      // This is safer and more robust than checking for existence first.
      await setDoc(userDocRef, userData, { merge: true });
      
      if (isNewUser) {
        toast({ title: 'Compte créé', description: 'Bienvenue sur Santé Zen ! Vous recevrez une notification de bienvenue sous peu.' });
      } else {
        toast({ title: 'Connexion réussie', description: 'Bon retour !' });
      }

    } catch (error) {
        console.error("Error writing user document:", error);
        toast({
            variant: "destructive",
            title: "Erreur de base de données",
            description: "Impossible de sauvegarder les informations utilisateur."
        });
    }
  };


  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        if (userCredential.user) {
            await handleUserCreation(userCredential.user, false);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        if (user) {
          if (data.name) {
            await updateProfile(user, { displayName: data.name });
          }
          await handleUserCreation(user, true);
        }
      }
      // Redirect handled by AuthLayout
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'authentification',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // The isNewUser flag for Google sign-in checks if creation time is the same as last sign-in time
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        await handleUserCreation(result.user, isNewUser);
    } catch (error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Erreur de connexion Google',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  const toggleFormMode = () => {
    form.reset();
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">
            {isLogin ? 'Se connecter' : 'Créer un compte'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Content de vous revoir !' : 'Rejoignez Santé Zen aujourd\'hui.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isLogin && selectedPlan && (
            <div className="mb-6 rounded-lg border bg-accent/20 p-3 text-center">
              <p className="font-semibold text-foreground">Plan sélectionné :</p>
              <Badge variant="secondary" className="mt-1 text-lg">
                <Sparkles className="mr-2 h-4 w-4 text-primary"/>
                {selectedPlan}
              </Badge>
            </div>
          )}
          
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                <GoogleIcon className="mr-2 h-5 w-5" />
                Continuer avec Google
           </Button>

            <div className="my-6 flex items-center">
                <Separator className="flex-1" />
                <span className="mx-4 text-xs text-muted-foreground">OU</span>
                <Separator className="flex-1" />
            </div>


          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? 'Se connecter' : 'S\'inscrire'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              {isLogin ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?'}{' '}
              <Button variant="link" className="p-0 h-auto" onClick={toggleFormMode}>
                {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
              </Button>
            </p>
            <p className="mt-4">
                <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/">Retour à l'accueil</Link>
                </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
