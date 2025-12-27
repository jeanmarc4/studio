'use server';
/**
 * @fileOverview Converts text to speech for medication reminders.
 *
 * - generateMedicationReminder - A function that takes text and returns a WAV audio data URI.
 * - GenerateMedicationReminderInput - The input type for the function.
 * - GenerateMedicationReminderOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateMedicationReminderInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type GenerateMedicationReminderInput = z.infer<
  typeof GenerateMedicationReminderInputSchema
>;

const GenerateMedicationReminderOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a WAV data URI.'),
});
export type GenerateMedicationReminderOutput = z.infer<
  typeof GenerateMedicationReminderOutputSchema
>;

export async function generateMedicationReminder(
  input: GenerateMedicationReminderInput
): Promise<GenerateMedicationReminderOutput> {
  return generateMedicationReminderFlow(input);
}

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

    let bufs = [] as any[];
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

const generateMedicationReminderFlow = ai.defineFlow(
  {
    name: 'generateMedicationReminderFlow',
    inputSchema: GenerateMedicationReminderInputSchema,
    outputSchema: GenerateMedicationReminderOutputSchema,
  },
  async ({text}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No audio media was generated.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
