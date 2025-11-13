'use server';
/**
 * @fileOverview Un vérificateur de symptômes IA qui suggère des diagnostics possibles en fonction des symptômes fournis par l'utilisateur.
 *
 * - aiSymptomChecker - Une fonction qui prend une liste de symptômes et renvoie des diagnostics possibles.
 * - AISymptomCheckerInput - Le type d'entrée pour la fonction aiSymptomChecker.
 * - AISymptomCheckerOutput - Le type de retour pour la fonction aiSymptomChecker.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISymptomCheckerInputSchema = z.object({
  symptoms: z
    .string()
    .describe('Une liste de symptômes séparés par des virgules que l\'utilisateur ressent.'),
});
export type AISymptomCheckerInput = z.infer<typeof AISymptomCheckerInputSchema>;

const AISymptomCheckerOutputSchema = z.object({
  possibleDiagnoses: z
    .string()
    .describe(
      'Une liste de diagnostics possibles basés sur les symptômes fournis, nécessite une confirmation par un vrai médecin.'
    ),
});
export type AISymptomCheckerOutput = z.infer<typeof AISymptomCheckerOutputSchema>;

export async function aiSymptomChecker(input: AISymptomCheckerInput): Promise<AISymptomCheckerOutput> {
  return aiSymptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomCheckerPrompt',
  input: {schema: AISymptomCheckerInputSchema},
  output: {schema: AISymptomCheckerOutputSchema},
  prompt: `Vous êtes un assistant IA conçu pour fournir des diagnostics possibles en fonction des symptômes d'un utilisateur. Vos diagnostics nécessitent une confirmation par un vrai médecin.\n
  Symptômes: {{{symptoms}}}\n
  Diagnostics possibles:`,
});

const aiSymptomCheckerFlow = ai.defineFlow(
  {
    name: 'aiSymptomCheckerFlow',
    inputSchema: AISymptomCheckerInputSchema,
    outputSchema: AISymptomCheckerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
