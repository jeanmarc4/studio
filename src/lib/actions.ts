'use server';

import { voiceControlledNavigation } from "@/ai/flows/voice-controlled-navigation";
import { generateMedicationReminder } from "@/ai/flows/generate-medication-reminder-flow";
import { benevolentChat } from "@/ai/flows/benevolent-chat-flow";
import { generateWellnessTip } from "@/ai/flows/generate-wellness-tip-flow";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function handleVoiceCommand(command: string): Promise<{ path?: string; error?: string }> {
  if (!command) {
    return { error: "Aucune commande fournie." };
  }

  try {
    const result = await voiceControlledNavigation({ voiceCommand: command });
    
    // Normalize navigation action to be a valid path
    const action = result.navigationAction.toLowerCase().trim();
    const validActions = ["dashboard", "medications", "doctors", "pathologies", "appointments", "admin", "settings", "todos", "holistic-care", "medical-files"];
    
    if (validActions.includes(action) && result.confidence > 0.6) {
      let path = `/${action}`;
      if (action === 'dashboard') path = '/dashboard';
      return { path };
    } else {
      return { error: "Je n'ai pas compris la destination. Essayez 'aller aux médicaments' par exemple." };
    }
  } catch (error) {
    console.error("Error processing voice command:", error);
    return { error: "Une erreur est survenue lors du traitement de votre commande." };
  }
}


export async function handleGenerateVoiceReminder(text: string): Promise<{ audioDataUri?: string; error?: string }> {
    if (!text) {
        return { error: "Aucun texte fourni pour générer le mémo." };
    }
    
    try {
        const result = await generateMedicationReminder({ text });
        return { audioDataUri: result.audioDataUri };
    } catch (error) {
        console.error("Error generating voice reminder:", error);
        return { error: "Impossible de générer le mémo vocal." };
    }
}

export async function handleBenevolentChat(message: string): Promise<{ response?: string; error?: string }> {
  if (!message) {
    return { error: "Le message ne peut pas être vide." };
  }
  try {
    const result = await benevolentChat({ message });
    return { response: result.response };
  } catch (error) {
    console.error("Error in benevolent chat:", error);
    return { error: "Désolé, une erreur est survenue lors de la communication avec l'assistant." };
  }
}

export async function handleGenerateWellnessTip(topic: string): Promise<{ tip?: { title: string; content: string; }; error?: string; }> {
    if (!topic) {
        return { error: "Veuillez sélectionner un sujet." };
    }
    try {
        const result = await generateWellnessTip({ topic });
        return { tip: result };
    } catch(error) {
        console.error("Error generating wellness tip:", error);
        return { error: "Désolé, une erreur est survenue lors de la génération du conseil." };
    }
}


const planPriceIds = {
    "Standard": process.env.STRIPE_STANDARD_PLAN_PRICE_ID,
    "Premium": process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
}

export async function createCheckoutSession(formData: FormData) {
    const plan = formData.get('plan') as keyof typeof planPriceIds;
    const userId = formData.get('userId') as string;

    if (!plan || !planPriceIds[plan] || !userId) {
        return { error: 'Plan ou utilisateur invalide.' };
    }

    const headersList = headers();
    const origin = headersList.get('origin');

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: planPriceIds[plan],
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/settings`,
            metadata: {
                userId: userId,
                plan: plan,
            }
        });

        if (session.url) {
            redirect(session.url);
        } else {
            throw new Error('Impossible de créer la session de paiement Stripe.');
        }

    } catch (error) {
        console.error('Erreur lors de la création de la session de paiement:', error);
        return { error: 'Impossible de rediriger vers la page de paiement.' };
    }
}
