
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, Loader2, AlertTriangle, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { aiSymptomChecker, AISymptomCheckerOutput } from "@/ai/ai-symptom-checker";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { User } from "@/docs/backend-documentation";

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: "Veuillez décrire vos symptômes en au moins 10 caractères.",
  }),
});


export function SymptomCheckerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AISymptomCheckerOutput | null>(null);
  const { user, isUserLoading, firestore } = useFirebase();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userProfileRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const aiResult = await aiSymptomChecker(values);
    setResult(aiResult);
    setIsLoading(false);
  }

  const isPremiumOrAdmin = userProfile?.role === 'Premium' || userProfile?.role === 'Admin';
  const isFeatureLocked = !isUserLoading && !isProfileLoading && !isPremiumOrAdmin;

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Sparkles className="text-accent" />
            <span>Décrivez Vos Symptômes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isFeatureLocked ? (
             <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                <Lock className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Fonctionnalité Premium</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                    Le vérificateur de symptômes IA est disponible uniquement pour les membres Premium et Admin. Passez à un forfait supérieur pour accéder à cette fonctionnalité.
                </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symptômes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex : 'J'ai mal à la gorge, le nez qui coule et une légère fièvre depuis 2 jours.'"
                          className="min-h-[120px] text-base"
                          {...field}
                          disabled={isLoading || isUserLoading || isProfileLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading || isUserLoading || isProfileLoading} className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    "Analyser les symptômes"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="max-w-2xl mx-auto mt-8 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline">Résultats de l'analyse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Diagnostics possibles :</h3>
              <p className="text-muted-foreground">{result.possibleDiagnoses}</p>
            </div>
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Avertissement</AlertTitle>
              <AlertDescription>
                Ceci n'est pas un diagnostic médical. Cet outil est à titre informatif uniquement. Veuillez consulter un professionnel de la santé pour un avis médical précis.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </>
  );
}
