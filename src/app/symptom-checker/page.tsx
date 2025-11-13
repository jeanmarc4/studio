import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { SymptomCheckerForm } from "./components/symptom-checker-form";

export default function SymptomCheckerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">Vérificateur de Symptômes IA</h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">
          Obtenez une analyse préliminaire de vos symptômes. Cet outil est alimenté par l'IA et fournit des informations, pas un diagnostic.
        </p>
      </header>

      <Alert className="max-w-2xl mx-auto mb-8 bg-amber-100 border-amber-300 dark:bg-amber-900/50 dark:border-amber-700">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Important : À titre informatif uniquement</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Consultez toujours un professionnel de la santé qualifié pour un avis médical, un diagnostic et un traitement.
        </AlertDescription>
      </Alert>

      <SymptomCheckerForm />
    </div>
  );
}
