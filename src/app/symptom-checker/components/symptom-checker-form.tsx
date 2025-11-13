"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, Loader2, AlertTriangle, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  symptoms: z.string().min(10, {
    message: "Please describe your symptoms in at least 10 characters.",
  }),
});

type SymptomCheckResult = {
  conditions: {
    name: string;
    probability: string;
  }[];
  triage: string;
};

const mockResult: SymptomCheckResult = {
  conditions: [
    { name: "Common Cold", probability: "High" },
    { name: "Allergic Rhinitis", probability: "Medium" },
    { name: "Influenza", probability: "Low" },
  ],
  triage: "Self-care recommended. Consult a doctor if symptoms worsen.",
};

export function SymptomCheckerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SymptomCheckResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    // Simulate GenAI flow call
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setResult(mockResult);
    setIsLoading(false);
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Sparkles className="text-accent" />
            <span>Describe Your Symptoms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I have a sore throat, runny nose, and a slight fever for the past 2 days.'"
                        className="min-h-[120px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Symptoms"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="max-w-2xl mx-auto mt-8 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Possible Conditions:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {result.conditions.map((condition) => (
                  <li key={condition.name}>
                    <span className="text-foreground">{condition.name}</span> - Probability: {condition.probability}
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4"/>Recommendation:</h3>
              <p className="text-muted-foreground">{result.triage}</p>
            </div>
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                This is not a medical diagnosis. This tool is for informational purposes only. Please consult with a healthcare professional for accurate medical advice.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </>
  );
}
