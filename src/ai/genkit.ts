
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Obtenez la clé API à partir des variables d'environnement.
const geminiApiKey = process.env.GEMINI_API_KEY;

// Vérification cruciale : Assurez-vous que la clé API est définie et valide.
if (!geminiApiKey || geminiApiKey === 'YOUR_API_KEY') {
  const errorMessage = "ERREUR CRITIQUE : La variable d'environnement GEMINI_API_KEY n'est pas définie ou est invalide. L'assistant IA ne pourra pas fonctionner. Veuillez créer un fichier .env à la racine de votre projet et y ajouter GEMINI_API_KEY=VOTRE_VRAIE_CLE_API.";
  console.error(errorMessage);
  if (typeof window !== 'undefined') {
    // Si nous sommes côté client, nous ne pouvons pas lancer d'erreur qui crasherait l'app.
    // L'erreur console est notre principal indicateur.
    console.error("Cette erreur empêchera toutes les fonctionnalités IA de fonctionner.");
  }
}

export const ai = genkit({
  plugins: [
    googleAI(), // Le plugin lit automatiquement GEMINI_API_KEY depuis process.env
  ],
});
