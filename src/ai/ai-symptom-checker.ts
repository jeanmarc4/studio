'use server';
/**
 * @fileOverview An AI Symptom Checker that suggests possible diagnoses based on user-provided symptoms.
 *
 * - aiSymptomChecker - A function that takes a list of symptoms and returns possible diagnoses.
 * - AISymptomCheckerInput - The input type for the aiSymptomChecker function.
 * - AISymptomCheckerOutput - The return type for the aiSymptomChecker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISymptomCheckerInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A comma separated list of symptoms experienced by the user.'),
});
export type AISymptomCheckerInput = z.infer<typeof AISymptomCheckerInputSchema>;

const AISymptomCheckerOutputSchema = z.object({
  possibleDiagnoses: z
    .string()
    .describe(
      'A list of possible diagnoses based on the symptoms provided, requires confirmation from a real doctor.'
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
  prompt: `You are an AI assistant designed to provide possible diagnoses based on a user\'s symptoms. Your diagnoses require confirmation from a real doctor.\n
  Symptoms: {{{symptoms}}}\n
  Possible Diagnoses:`,
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
