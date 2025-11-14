
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";

import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";

const formSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
});

export default function ForgotPasswordPage() {
  const { auth } = useFirebase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsEmailSent(true);
      toast({
        title: "E-mail envoyé",
        description: "Veuillez vérifier votre boîte de réception pour réinitialiser votre mot de passe.",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez vérifier l'adresse e-mail et réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl font-headline">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEmailSent ? (
            <div className="text-center space-y-4">
              <p>Un e-mail a été envoyé à <span className="font-bold">{form.getValues("email")}</span>. Veuillez suivre les instructions pour réinitialiser votre mot de passe.</p>
              <Button asChild>
                <Link href="/auth/login">Retour à la connexion</Link>
              </Button>
            </div>
          ) : (
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Envoyer le lien
                </Button>
              </form>
            </Form>
          )}
          <div className="mt-4 text-center text-sm">
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link href="/auth/login" className="underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
