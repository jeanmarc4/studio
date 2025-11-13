
'use server';
/**
 * @fileOverview Un flux Genkit pour expliquer l'utilité d'un médicament, avec un cache en mémoire.
 *
 * - explainMedication - Une fonction qui prend le nom d'un médicament et renvoie une explication simple.
 * - MedicationExplanationInput - Le type d'entrée pour la fonction.
 * - MedicationExplanationOutput - Le type de retour pour la fonction.
 */

import { ai, ensureApiKey } from '@/ai/genkit';
import { z } from 'genkit';

// Cache simple en mémoire pour stocker les explications déjà générées.
const explanationCache = new Map<string, string>();

const MedicationExplanationInputSchema = z.object({
  medicationName: z.string().describe('Le nom du médicament à expliquer.'),
});
export type MedicationExplanationInput = z.infer<typeof MedicationExplanationInputSchema>;

const MedicationExplanationOutputSchema = z.object({
  explanation: z.string().describe("L'explication simple de l'utilité du médicament."),
});
export type MedicationExplanationOutput = z.infer<typeof MedicationExplanationOutputSchema>;

export async function explainMedication(input: MedicationExplanationInput): Promise<MedicationExplanationOutput> {
  return explainMedicationFlow(input);
}

const explainMedicationFlow = ai.defineFlow(
  {
    name: 'explainMedicationFlow',
    inputSchema: MedicationExplanationInputSchema,
    outputSchema: MedicationExplanationOutputSchema,
  },
  async ({ medicationName }) => {
    ensureApiKey(); // Vérifie la présence de la clé API
    
    const cacheKey = medicationName.trim().toLowerCase();
    
    // 1. Vérifier si l'explication est déjà dans le cache.
    if (explanationCache.has(cacheKey)) {
      return { explanation: explanationCache.get(cacheKey)! };
    }

    // 2. Si ce n'est pas dans le cache, appeler l'IA.
    const { output } = await ai.generate({
      prompt: `Tu es un assistant médical IA, spécialisé dans la vulgarisation d'informations complexes pour les patients.
Un patient te demande à quoi sert le médicament suivant : ${medicationName}.

Ton objectif est de fournir une explication très simple, claire et rassurante en 2-3 phrases maximum. N'utilise pas de jargon médical.
Commence ta réponse directement par l'explication.

Exemple de réponse pour "Doliprane":
"Le Doliprane est utilisé pour soulager les douleurs légères à modérées comme les maux de tête, les douleurs dentaires ou les courbatures, et pour faire baisser la fièvre. C'est un antalgique et un antipyrétique courant qui aide votre corps à se sentir mieux lorsque vous êtes malade."

Maintenant, fournis l'explication pour le médicament : ${medicationName}.`,
      output: { schema: MedicationExplanationOutputSchema },
    });
    
    if (!output?.explanation) {
      return { explanation: "Désolé, je n'ai pas pu trouver d'informations pour ce médicament." };
    }
    
    // 3. Mettre en cache la nouvelle explication avant de la renvoyer.
    explanationCache.set(cacheKey, output.explanation);
    
    return output;
  }
);
