
'use server';
/**
 * @fileOverview Un flux Genkit pour générer des rappels vocaux pour la prise de médicaments.
 *
 * - getVocalReminder - Une fonction qui génère un rappel vocal en utilisant l'IA.
 * - VocalReminderInput - Le type d'entrée pour la fonction getVocalReminder.
 * - VocalReminderOutput - Le type de retour pour la fonction getVocalReminder.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {z} from 'genkit';
import wav from 'wav';

const VocalReminderInputSchema = z.object({
  medicationName: z.string().describe('Le nom du médicament.'),
  dosage: z.string().describe('Le dosage du médicament.'),
});
export type VocalReminderInput = z.infer<typeof VocalReminderInputSchema>;

const VocalReminderOutputSchema = z.object({
  audioUrl: z
    .string()
    .describe(
      "L'URL de données de l'audio généré au format WAV, encodé en Base64."
    ),
});
export type VocalReminderOutput = z.infer<typeof VocalReminderOutputSchema>;

export async function getVocalReminder(
  input: VocalReminderInput
): Promise<VocalReminderOutput> {
  return vocalReminderFlow(input);
}

// Convertit les données audio PCM brutes de l'API en un fichier WAV encodé en Base64.
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const reminderPrompt = ai.definePrompt(
    {
        name: 'vocalReminderPrompt',
        input: { schema: VocalReminderInputSchema },
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
            },
        },
    },
    async ({ medicationName }) => {
        return `C'est un petit rappel amical pour vous. Il est maintenant l'heure de prendre votre médicament : ${medicationName}. Prenez bien soin de vous !`;
    }
);


const vocalReminderFlow = ai.defineFlow(
  {
    name: 'vocalReminderFlow',
    inputSchema: VocalReminderInputSchema,
    outputSchema: VocalReminderOutputSchema,
  },
  async (input) => {
    const { media } = await reminderPrompt(input);

    if (!media) {
      throw new Error("Aucun média audio n'a été retourné par l'API.");
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioUrl: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
