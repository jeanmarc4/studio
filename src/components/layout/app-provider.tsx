'use client';
    import { getMessaging, onMessage, getToken } from "firebase/messaging";
    import { useEffect } from 'react';
import { type ReactNode } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Toaster } from '@/components/ui/toaster';
const lireMessageVocal = (message: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'fr-FR'; // Langue française
            window.speechSynthesis.speak(utterance);
            console.log(`[CLIENT] Lecture vocale: "${message}"`);
        } else {
            console.warn("[CLIENT] L'API Text-to-Speech n'est pas supportée par ce navigateur.");
        }
    };

    // Votre composant Provider existant (ex: FirebaseProvider, AppProvider, etc.)
    export default function AppProvider({
      children,
    }: {
      children: React.ReactNode;
    }) {
      useEffect(() => {
        // Initialisation de Firebase Messaging
        const messaging = getMessaging(app); // 'app' doit être l'instance Firebase de votre projet
        
        // Demander la permission et obtenir le token FCM
        getToken(messaging, { vapidKey: 'BHkuveCx4iaDCcw1aSZmIym-77m1bQoZeqUstxq71BAxsOHGl63nqLPHcTJLJ6QCiZSMUV6X1JDqvk9Le6C13Dg' }).then((currentToken) => { // Remplacez par votre VAPID Key réelle
          if (currentToken) {
            console.log("[CLIENT] FCM registration token:", currentToken);
            // TODO: Intégrez ici la logique pour stocker ce token dans Firestore associé à l'userId
            // Votre application gère probablement déjà les utilisateurs et la base de données.
          } else {
            console.log('[CLIENT] Aucun jeton FCM disponible. Demandez la permission.');
          }
        }).catch((err) => {
          console.error('[CLIENT] Erreur lors de la récupération du token FCM. ', err);
        });

        // Écouter les messages FCM en premier plan (quand l'app est ouverte et active)
        onMessage(messaging, (payload) => {
          console.log('[CLIENT] Message FCM reçu (en premier plan):', payload);
          const messageToSpeak = payload.notification?.body || payload.data?.messageToSpeak || "Rappel !";
          lireMessageVocal(messageToSpeak); // Lire directement en premier plan
        });

        // Écouter les messages du Service Worker (après un clic sur notification, quand l'app s'ouvre)
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data && event.data.type === 'PLAY_SPEAKING_MESSAGE' && event.data.message) {
                console.log('[CLIENT] Message reçu du SW: Jouer le message:', event.data.message);
                lireMessageVocal(event.data.message);
              }
            });
          });
        }
      }, []); // Exécute une seule fois au montage du composant client

      return (
        // ... votre rendu de Provider existant ...
        <>
          {children}

export function AppProvider({ children }: { children: ReactNode }) {

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        <FirebaseClientProvider>
            <AuthLayout>{children}</AuthLayout>
            <Toaster />
        </FirebaseClientProvider>
    </ThemeProvider>
  );
}
