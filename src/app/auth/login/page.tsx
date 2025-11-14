
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { auth, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Connexion réussie",
        description: "Vous allez être redirigé vers la page d'accueil.",
      });
      setIsNavigating(true);
      // Let the useEffect handle the redirection to avoid race conditions.
    } catch (error: any) {
      let description = "Une erreur est survenue lors de la connexion.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === 'auth/invalid-credential') {
        description = "L'adresse e-mail ou le mot de passe est incorrect.";
      }
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description,
      });
      setIsLoading(false);
    }
    // No finally block needed as we handle state separately now
  }
  
  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl font-headline">Connexion</CardTitle>
          <CardDescription>
            Entrez votre email ci-dessous pour vous connecter à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <div className="flex items-center">
                      <FormLabel>Mot de passe</FormLabel>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || isNavigating}>
                {(isLoading || isNavigating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connexion
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Vous n'avez pas de compte ?{" "}
            <Link href="/auth/signup" className="underline">
              S'inscrire
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
