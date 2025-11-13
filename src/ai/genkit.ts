
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
  // Définir un modèle par défaut stable pour les tâches de conversation.
  model: 'googleai/gemini-1.5-flash-latest',
});

