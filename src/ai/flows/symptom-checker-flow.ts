
'use server';
/**
 * @fileOverview Flux Genkit pour un vérificateur de symptômes intelligent.
 *
 * - suggestNextSteps - Une fonction qui prend une conversation et suggère les prochaines étapes.
 * - SymptomCheckerInput - Le type d'entrée pour la fonction.
 * - SymptomCheckerOutput - Le type de retour pour la fonction.
 */

import { ai, ensureApiKey } from '@/ai/genkit';
import { z } from 'genkit';

const SymptomCheckerInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
});
export type SymptomCheckerInput = z.infer<typeof SymptomCheckerInputSchema>;

const SymptomCheckerOutputSchema = z.object({
  analysis: z.string().describe("L'analyse des symptômes et les prochaines étapes suggérées par l'IA."),
});
export type SymptomCheckerOutput = z.infer<typeof SymptomCheckerOutputSchema>;

export async function suggestNextSteps(input: SymptomCheckerInput): Promise<SymptomCheckerOutput> {
  return symptomCheckerFlow(input);
}

const disclaimer = "AVERTISSEMENT : Je suis un assistant IA et non un professionnel de la santé. Les informations que je fournis ne constituent pas un avis médical. Veuillez consulter un médecin qualifié pour tout problème de santé ou avant de prendre toute décision médicale.";

const symptomCheckerFlow = ai.defineFlow(
  {
    name: 'symptomCheckerFlow',
    inputSchema: SymptomCheckerInputSchema,
    outputSchema: SymptomCheckerOutputSchema,
  },
  async ({ history }) => {
    ensureApiKey(); // Vérifie la présence de la clé API

    const { text } = await ai.generate({
      system: `Vous êtes un assistant médical IA empathique et serviable. Votre rôle est d'écouter les symptômes d'un utilisateur et de lui fournir des informations générales et des suggestions sur le type de professionnel de la santé qu'il pourrait consulter.

Règles importantes :
1.  Commencez TOUJOURS votre réponse par l'avertissement suivant, mot pour mot : "${disclaimer}"
2.  NE JAMAIS poser de diagnostic. N'utilisez pas de langage qui pourrait être interprété comme un diagnostic (par exemple, "vous avez probablement...", "cela ressemble à...").
3.  Utilisez un langage prudent. Suggérez des possibilités, ne déclarez pas de certitudes.
4.  Votre objectif est d'orienter, pas de diagnostiquer. Suggérez des types de spécialistes (par exemple, "un médecin généraliste", "un dermatologue", "un cardiologue") qui sont pertinents pour les symptômes décrits.
5.  Gardez vos réponses concises et faciles à comprendre.

Analysez la conversation suivante et fournissez une réponse utile qui suit ces règles.`,
      history: history.map(m => ({role: m.role, content: m.content})),
    });

    let analysis = text;

    if (!analysis) {
      analysis = "Désolé, je ne suis pas en mesure de traiter votre demande pour le moment.";
    }

    // Assurez-vous que l'avertissement est toujours présent.
    if (!analysis.startsWith('AVERTISSEMENT')) {
      analysis = `${disclaimer}\n\n${analysis}`;
    }

    return { analysis };
  }
);
