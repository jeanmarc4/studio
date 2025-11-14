'use server';
/**
 * @fileOverview Flux Genkit pour un vérificateur de symptômes intelligent.
 *
 * - suggestNextSteps - Une fonction qui prend une conversation et suggère les prochaines étapes.
 * - SymptomCheckerHistory - Le type d'entrée pour la fonction.
 * - SymptomCheckerOutput - Le type de retour pour la fonction.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SymptomCheckerHistorySchema = z.object({
  history: z.array(MessageSchema)
});
export type SymptomCheckerHistory = z.infer<typeof SymptomCheckerHistorySchema>;

const SymptomCheckerOutputSchema = z.object({
  analysis: z.string().describe("L'analyse des symptômes et les prochaines étapes suggérées par l'IA."),
});
export type SymptomCheckerOutput = z.infer<typeof SymptomCheckerOutputSchema>;

export async function suggestNextSteps(input: SymptomCheckerHistory): Promise<SymptomCheckerOutput> {
  return symptomCheckerFlow(input);
}

const disclaimer = "AVERTISSEMENT : Je suis un assistant IA et non un professionnel de la santé. Les informations que je fournis ne constituent pas un avis médical. Veuillez consulter un médecin qualifié pour tout problème de santé ou avant de prendre toute décision médicale.";

const systemPrompt = `Vous êtes un assistant médical IA empathique et serviable. Votre rôle est d'écouter les symptômes d'un utilisateur et de lui fournir des informations générales et des suggestions sur le type de professionnel de la santé qu'il pourrait consulter.

Règles importantes :
1.  Commencez TOUJOURS votre réponse par l'avertissement suivant, mot pour mot : "${disclaimer}"
2.  NE JAMAIS poser de diagnostic. N'utilisez pas de langage qui pourrait être interprété comme un diagnostic (par exemple, "vous avez probablement...", "cela ressemble à...").
3.  Utilisez un langage prudent. Suggérez des possibilités, ne déclarez pas de certitudes.
4.  Votre objectif est d'orienter, pas de diagnostiquer. Suggérez des types de spécialistes (par exemple, "un médecin généraliste", "un dermatologue", "un cardiologue") qui sont pertinents pour les symptômes décrits.
5.  Gardez vos réponses concises et faciles à comprendre.

Analysez la conversation suivante et fournissez une réponse utile qui suit ces règles.`;


const symptomCheckerFlow = ai.defineFlow(
  {
    name: 'symptomCheckerFlow',
    inputSchema: SymptomCheckerHistorySchema,
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const { text } = await ai.generate({
        model: googleAI.model('gemini-1.5-flash'),
        prompt: `${systemPrompt}\n\nHistorique de la conversation:\n${input.history.map(m => `${m.role}: ${m.content}`).join('\n')}\nModel:`,
      });
      
      if (!text) {
        throw new Error("La réponse de l'IA est vide.");
      }
      
      if (!text.startsWith('AVERTISSEMENT')) {
        return `${disclaimer}\n\n${text}`;
      }

      return text;
    } catch (e) {
      console.error("Erreur dans symptomCheckerFlow:", e);
      throw new Error(`${disclaimer}\n\nDésolé, une erreur est survenue. Veuillez réessayer plus tard.`);
    }
  }
).then(text => ({ analysis: text }));
