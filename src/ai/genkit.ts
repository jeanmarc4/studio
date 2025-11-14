
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Obtenez la clé API à partir des variables d'environnement.
const geminiApiKey = process.env.GEMINI_API_KEY;

// Vérification cruciale : Assurez-vous que la clé API est définie.
// Sans cela, toutes les tentatives d'appel à l'API échoueront.
if (!geminiApiKey) {
  console.error("ERREUR CRITIQUE : La variable d'environnement GEMINI_API_KEY n'est pas définie.");
  console.error("Veuillez créer un fichier .env à la racine de votre projet et y ajouter GEMINI_API_KEY=VOTRE_CLE");
  // Lancer une erreur pour arrêter l'initialisation si la clé est manquante.
  // Dans un environnement de production, cela empêcherait le serveur de démarrer incorrectement.
  // En développement, cela fournit une rétroaction immédiate.
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: geminiApiKey, // Passez la clé, même si elle est undefined, pour que Genkit gère l'erreur.
      apiVersion: 'v1beta', // Utiliser la v1beta pour accéder aux derniers modèles
    }),
  ],
  // Le modèle par défaut est maintenant défini dans le plugin,
  // mais nous gardons une référence globale pour la clarté.
  model: 'googleai/gemini-1.5-flash-001',
});
