'use server';
/**
 * @fileOverview Generates wellness tips on various topics.
 *
 * - generateWellnessTip - A function that provides a wellness tip on a given topic.
 * - WellnessTipInput - The input type for the function.
 * - WellnessTipOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WellnessTipInputSchema = z.object({
  topic: z.string().describe("The wellness topic, e.g., 'Nutrition', 'Stress', 'Sommeil'."),
});
export type WellnessTipInput = z.infer<typeof WellnessTipInputSchema>;

const WellnessTipOutputSchema = z.object({
  title: z.string().describe('A catchy title for the wellness tip.'),
  content: z
    .string()
    .describe('The wellness tip content. It should be a short, actionable paragraph.'),
});
export type WellnessTipOutput = z.infer<typeof WellnessTipOutputSchema>;

export async function generateWellnessTip(
  input: WellnessTipInput
): Promise<WellnessTipOutput> {
  return generateWellnessTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'wellnessTipPrompt',
  input: {schema: WellnessTipInputSchema},
  output: {schema: WellnessTipOutputSchema},
  prompt: `You are a benevolent and knowledgeable AI assistant for the Santé Zen app.
Your role is to provide simple, actionable, and encouraging wellness tips.

The user has requested a tip on the following topic: {{{topic}}}.

Generate a short, positive, and easy-to-understand wellness tip.
The tip should have a clear title and a concise paragraph of content.
Do not provide medical advice. Keep the tone light and supportive.
Respond in French.`,
});

const generateWellnessTipFlow = ai.defineFlow(
  {
    name: 'generateWellnessTipFlow',
    inputSchema: WellnessTipInputSchema,
    outputSchema: WellnessTipOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
