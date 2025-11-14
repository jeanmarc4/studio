'use server';
/**
 * @fileOverview Un flux Genkit pour expliquer l'utilité d'un médicament, avec un cache en mémoire.
 *
 * - explainMedication - Une fonction qui prend le nom d'un médicament et renvoie une explication simple.
 * - MedicationExplanationInput - Le type d'entrée pour la fonction.
 * - MedicationExplanationOutput - Le type de retour pour la fonction.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
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

const systemPrompt = `Tu es un assistant médical IA, spécialisé dans la vulgarisation d'informations complexes pour les patients.
Ton objectif est de fournir une explication très simple, claire et rassurante en 2-3 phrases maximum. N'utilise pas de jargon médical.
Commence ta réponse directement par l'explication.

Exemple de réponse pour "Doliprane":
"Le Doliprane est utilisé pour soulager les douleurs légères à modérées comme les maux de tête, les douleurs dentaires ou les courbatures, et pour faire baisser la fièvre. C'est un antalgique et un antipyrétique courant qui aide votre corps à se sentir mieux lorsque vous êtes malade."

Maintenant, fournis l'explication pour le médicament demandé.`;


const explainMedicationFlow = ai.defineFlow(
  {
    name: 'explainMedicationFlow',
    inputSchema: MedicationExplanationInputSchema,
    outputSchema: MedicationExplanationOutputSchema,
  },
  async (input) => {
    const cacheKey = input.medicationName.trim().toLowerCase();
    
    // 1. Vérifier si l'explication est déjà dans le cache.
    if (explanationCache.has(cacheKey)) {
      return { explanation: explanationCache.get(cacheKey)! };
    }

    try {
      // 2. Appeler le prompt défini
      const { text } = await ai.generate({
        model: googleAI.model('gemini-1.5-flash'),
        prompt: `${systemPrompt}\n\nMédicament : ${input.medicationName}`,
      });

      if (!text) {
        throw new Error("La réponse de l'IA est vide.");
      }
      
      const explanation = text;

      // 3. Mettre en cache la nouvelle explication avant de la renvoyer.
      explanationCache.set(cacheKey, explanation);
      
      return { explanation };

    } catch (e) {
      console.error("Erreur dans explainMedicationFlow:", e);
      return { explanation: "Désolé, une erreur est survenue lors de la communication avec le service IA. Veuillez réessayer." };
    }
  }
);
