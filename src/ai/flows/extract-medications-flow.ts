
'use server';
/**
 * @fileOverview Un flux Genkit pour extraire les informations sur les médicaments d'une image d'ordonnance.
 *
 * - extractMedicationsFromPrescription - Une fonction qui prend l'URL de l'image d'une ordonnance et renvoie les médicaments structurés.
 * - MedicationExtractionInput - Le type d'entrée pour la fonction.
 * - MedicationExtractionOutput - Le type de retour pour la fonction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schéma pour un seul médicament extrait
const ExtractedMedicationSchema = z.object({
  name: z.string().describe("Le nom du médicament, par exemple 'Doliprane'."),
  dosage: z.string().describe("Le dosage par prise, par exemple '1g' ou '1 comprimé'."),
  quantity: z.number().optional().describe("La quantité totale dans la boîte, par exemple 30."),
  intakeTimes: z.array(z.string()).describe("Une liste des moments de la journée pour la prise, par exemple ['matin', 'midi', 'soir'] ou une description comme '3 fois par jour'.").optional(),
}).describe("Un seul médicament extrait de l'ordonnance.");

// Type pour un seul médicament, pour l'exportation
export type ExtractedMedication = z.infer<typeof ExtractedMedicationSchema>;

// Schéma pour l'entrée du flux
const MedicationExtractionInputSchema = z.object({
  prescriptionImageUrl: z.string().describe("L'URL de données de l'image de l'ordonnance, encodée en Base64. Format attendu : 'data:<mimetype>;base64,<donnees_encodees>'."),
});
export type MedicationExtractionInput = z.infer<typeof MedicationExtractionInputSchema>;

// Schéma pour la sortie du flux
const MedicationExtractionOutputSchema = z.object({
  medications: z.array(ExtractedMedicationSchema).describe("Une liste de tous les médicaments extraits de l'ordonnance."),
});
export type MedicationExtractionOutput = z.infer<typeof MedicationExtractionOutputSchema>;

// Wrapper exporté pour appeler le flux
export async function extractMedicationsFromPrescription(input: MedicationExtractionInput): Promise<MedicationExtractionOutput> {
  return extractMedicationsFlow(input);
}


const systemPrompt = `Vous êtes un assistant pharmaceutique expert en reconnaissance optique de caractères sur des ordonnances médicales. Votre tâche est d'analyser l'image d'ordonnance fournie et d'extraire TOUS les médicaments listés avec leurs détails.

Pour chaque médicament, vous devez identifier :
1.  **Le nom** (par exemple, "Amoxicilline", "Doliprane").
2.  **Le dosage** (par exemple, "500mg", "1g", "1 comprimé").
3.  **La quantité** (par exemple, le nombre de comprimés dans la boîte, si spécifié).
4.  **La posologie (intakeTimes)** : Comment et quand le prendre (par exemple, ["matin", "soir"], ["3 fois par jour pendant 7 jours"]).

Analysez l'image suivante et renvoyez les informations sous forme de liste d'objets structurés. Si aucune information n'est trouvée pour un champ, omettez-le si possible. Si aucun médicament n'est détecté, renvoyez une liste vide.`;

const extractionPrompt = ai.definePrompt({
    name: 'extractMedicationPrompt',
    input: { schema: MedicationExtractionInputSchema },
    output: { schema: MedicationExtractionOutputSchema },
    prompt: [
        { text: systemPrompt },
        { media: { url: '{{prescriptionImageUrl}}' } },
    ],
    model: 'googleai/gemini-1.5-flash' // Specify model here
});


// Définition du flux Genkit
const extractMedicationsFlow = ai.defineFlow(
  {
    name: 'extractMedicationsFlow',
    inputSchema: MedicationExtractionInputSchema,
    outputSchema: MedicationExtractionOutputSchema,
  },
  async ({ prescriptionImageUrl }) => {
    
    try {
      const { output } = await extractionPrompt({ prescriptionImageUrl });

      if (!output) {
        // Si la sortie est nulle, cela signifie probablement que le modèle n'a rien pu générer.
        return { medications: [] };
      }
      return output;
    } catch(e) {
      console.error("Erreur dans extractMedicationsFlow:", e);
      // En cas d'erreur API, retourner une liste vide pour éviter un crash
      return { medications: [] };
    }
  }
);
