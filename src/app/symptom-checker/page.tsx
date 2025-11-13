import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { SymptomCheckerForm } from "./components/symptom-checker-form";

export default function SymptomCheckerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">AI Symptom Checker</h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">
          Get a preliminary analysis of your symptoms. This tool is powered by AI and provides information, not a diagnosis.
        </p>
      </header>

      <Alert className="max-w-2xl mx-auto mb-8 bg-amber-100 border-amber-300 dark:bg-amber-900/50 dark:border-amber-700">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Important: For Informational Purposes Only</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Always consult a qualified healthcare provider for medical advice, diagnosis, and treatment.
        </AlertDescription>
      </Alert>

      <SymptomCheckerForm />
    </div>
  );
}
