
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// La clé API est maintenant optionnelle pour permettre à l'application de démarrer.
// Les flux vérifieront individuellement si la clé est disponible.
const geminiApiKey = process.env.GEMINI_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: geminiApiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});

/**
 * Une fonction utilitaire pour vérifier la disponibilité de la clé API et renvoyer une erreur claire.
 * Chaque flux qui dépend de l'IA devrait appeler cette fonction au début.
 * @returns {string} La clé API si elle est disponible.
 * @throws {Error} Si la clé API est manquante.
 */
export function ensureApiKey(): string {
  if (!geminiApiKey) {
    throw new Error(
      "La variable d'environnement GEMINI_API_KEY est manquante. " +
      "Veuillez l'ajouter à votre fichier .env pour utiliser les fonctionnalités d'IA. " +
      "Vous pouvez obtenir une clé depuis Google AI Studio."
    );
  }
  return geminiApiKey;
}
