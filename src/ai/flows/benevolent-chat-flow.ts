'use server';
/**
 * @fileOverview A benevolent AI assistant for holistic care.
 *
 * - benevolentChat - A function that provides a supportive chat response.
 * - BenevolentChatInput - The input type for the benevolentChat function.
 * - BenevolentChatOutput - The return type for the benevolentChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BenevolentChatInputSchema = z.object({
  message: z.string().describe('The user\'s message.'),
});
export type BenevolentChatInput = z.infer<typeof BenevolentChatInputSchema>;

const BenevolentChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s supportive and kind response.'),
});
export type BenevolentChatOutput = z.infer<typeof BenevolentChatOutputSchema>;

export async function benevolentChat(
  input: BenevolentChatInput
): Promise<BenevolentChatOutput> {
  return benevolentChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'benevolentChatPrompt',
  input: {schema: BenevolentChatInputSchema},
  output: {schema: BenevolentChatOutputSchema},
  prompt: `You are a benevolent and supportive AI assistant for the Santé Zen app. Your role is to provide comfort, encouragement, and a listening ear.

IMPORTANT: You must NOT provide any medical advice, diagnosis, or treatment recommendations. If the user asks for medical advice, gently decline and suggest they consult a healthcare professional.

Your tone should be warm, empathetic, and positive. Keep your responses concise and easy to understand.

User message: {{{message}}}

Generate a supportive and kind response.`,
});

const benevolentChatFlow = ai.defineFlow(
  {
    name: 'benevolentChatFlow',
    inputSchema: BenevolentChatInputSchema,
    outputSchema: BenevolentChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
