'use server';

/**
 * @fileOverview Enables voice-controlled navigation within the app for users with motor impairments.
 *
 * - voiceControlledNavigation - A function that determines the appropriate navigation action based on voice input.
 * - VoiceControlledNavigationInput - The input type for the voiceControlledNavigation function.
 * - VoiceControlledNavigationOutput - The return type for the voiceControlledNavigation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceControlledNavigationInputSchema = z.object({
  voiceCommand: z
    .string()
    .describe('The voice command spoken by the user.'),
});
export type VoiceControlledNavigationInput = z.infer<typeof VoiceControlledNavigationInputSchema>;

const VoiceControlledNavigationOutputSchema = z.object({
  navigationAction: z
    .string()
    .describe(
      'The navigation action to perform based on the voice command.  Examples include:  "medications", "doctors", "pathologies", "appointments", "admin", "settings".'      
    ),
  confidence: z.number().describe('The confidence level (0-1) that the navigation action is correct.'),
});
export type VoiceControlledNavigationOutput = z.infer<typeof VoiceControlledNavigationOutputSchema>;

export async function voiceControlledNavigation(
  input: VoiceControlledNavigationInput
): Promise<VoiceControlledNavigationOutput> {
  return voiceControlledNavigationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceControlledNavigationPrompt',
  input: {schema: VoiceControlledNavigationInputSchema},
  output: {schema: VoiceControlledNavigationOutputSchema},
  prompt: `You are a navigation assistant for a mobile application called Santé Zen, designed for users with disabilities.  Your task is to determine the correct screen to navigate to based on the user's voice command.  The app has the following screens:

- Medications: For managing and scheduling medication intake.
- Doctors: For accessing doctor profiles and contact information.
- Pathologies: For tracking symptoms related to specific health conditions.
- Appointments: For managing medical appointments and setting reminders.
- Admin: For administrative tasks (only accessible to admin users).
- Settings: For user settings and preferences.

Given the user's voice command, determine the most appropriate screen to navigate to.  Respond with the "navigationAction" and a "confidence" score (0-1) indicating the accuracy of your determination.  The output should be JSON parseable.

Voice Command: {{{voiceCommand}}}`,
});

const voiceControlledNavigationFlow = ai.defineFlow(
  {
    name: 'voiceControlledNavigationFlow',
    inputSchema: VoiceControlledNavigationInputSchema,
    outputSchema: VoiceControlledNavigationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
