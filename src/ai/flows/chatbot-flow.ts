
'use server';
/**
 * @fileOverview Flux Genkit pour un chatbot de soutien émotionnel.
 *
 * - mentalCareChat - Une fonction qui prend un historique de conversation et renvoie une réponse empathique.
 * - ChatHistory - Le type d'entrée pour la fonction.
 * - ChatOutput - Le type de retour pour la fonction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatHistoryInputSchema = z.object({
  history: z.array(MessageSchema),
});
export type ChatHistory = z.infer<typeof ChatHistoryInputSchema>;


const ChatOutputSchema = z.object({
  response: z.string().describe("La réponse bienveillante et de soutien de l'IA."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function mentalCareChat(input: ChatHistory): Promise<ChatOutput> {
  return mentalCareChatFlow(input);
}

const mentalCareChatFlow = ai.defineFlow(
  {
    name: 'mentalCareChatFlow',
    inputSchema: ChatHistoryInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history }) => {
    
    const systemPrompt = `Tu es un chatbot de soutien émotionnel nommé 'SanteConnect Moral'. Ton rôle est d'être un auditeur empathique, bienveillant et sans jugement. Ta personnalité est douce, calme et rassurante.

Règles de conversation :
1. Écoute activement : Valide toujours les sentiments de l'utilisateur (par ex., "Je comprends que cela doit être difficile", "Merci de partager cela avec moi").
2. Pose des questions ouvertes : Encourage l'utilisateur à développer sa pensée (par ex., "Comment vous êtes-vous senti à ce moment-là ?", "Qu'est-ce qui vous préoccupe le plus ?").
3. Ne donne jamais de conseils médicaux ou de diagnostic. Tu n'es pas un thérapeute. Ton rôle est d'écouter et d'offrir un soutien émotionnel.
4. Si l'utilisateur exprime une détresse sévère, une crise ou des pensées suicidaires, réponds IMMÉDIATEMENT par ce message EXACT et rien d'autre : "Je suis très préoccupé par ce que vous me dites. Il est très important que vous parliez à quelqu'un qui peut vous aider immédiatement. Veuillez contacter un professionnel de la santé ou une ligne d'écoute spécialisée. Vous n'êtes pas seul(e)."
5. Garde tes réponses concises, mais chaleureuses. Utilise un langage simple et accessible.
6. Le but n'est pas de "résoudre" les problèmes, mais d'offrir un espace sûr pour que l'utilisateur puisse s'exprimer.

Analyse la conversation suivante et fournis une réponse qui suit ces règles.`;

    const { text } = await ai.generate({
      model: 'googleai/gemini-pro',
      system: systemPrompt,
      history: history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
    });

    if (!text) {
      return { response: "Désolé, je ne suis pas en mesure de traiter votre demande pour le moment." };
    }
    
    return { response: text };
  }
);
