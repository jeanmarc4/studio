'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { AppFooter } from './footer';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


const UNAUTHENTICATED_ROUTES = ['/login', '/legal', '/privacy'];
// Note: '/' is handled separately to allow landing page access when not logged in.

const VAPID_KEY = 'BHkuveCx4iaDCcw1aSZmIym-77m1bQoZeqUstxq71BAxsOHGl63nqLPHcTJLJ6QCiZSMUV6X1JDqvk9Le6C13Dg';


export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading, firestore, firebaseApp, areServicesAvailable } = useFirebase();

  const isUnauthenticatedRoute = UNAUTHENTICATED_ROUTES.includes(pathname);
  const isLandingPage = pathname === '/';

  // --- Notification and Service Worker Logic ---
  useEffect(() => {
    if (!areServicesAvailable || !user || !firestore || !firebaseApp) return;

    // This function will be called once after all checks pass.
    const setupNotifications = async () => {
      // 1. Check for Service Worker and FCM support
      const isFcmSupported = await isSupported();
      if (!('serviceWorker' in navigator) || !isFcmSupported) {
        console.warn("Notifications non supportées par ce navigateur.");
        return;
      }

      // 2. Register the service worker
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service worker enregistré avec succès, scope:', registration.scope);
      } catch (error) {
        console.error("Erreur d'enregistrement du Service Worker:", error);
        return; // Stop if registration fails
      }

      // 3. Set up foreground message listener
      const messaging = getMessaging(firebaseApp);
      const unsubscribeOnMessage = onMessage(messaging, (payload) => {
        console.log('[APP] Message au premier plan reçu. ', payload);
        toast({
          title: payload.data?.title || "Notification",
          description: payload.data?.body,
        });
      });

      // 4. Request permission and get token
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (currentToken) {
            console.log('Token FCM obtenu:', currentToken);
            const userDocRef = doc(firestore, 'users', user.uid);
            // Use setDoc with merge to avoid overwriting existing user data
            await setDoc(userDocRef, {
              fcmTokens: arrayUnion(currentToken),
              lastTokenUpdate: serverTimestamp(),
            }, { merge: true });
          } else {
            console.warn('Impossible d\'obtenir le jeton FCM. L\'utilisateur doit peut-être ré-autoriser les notifications.');
          }
        } else {
            console.warn('Permission de notification non accordée.');
        }
      } catch (error) {
        console.error('Une erreur est survenue lors de l\'obtention du jeton.', error);
      }

      // 5. Return cleanup function
      return () => {
        unsubscribeOnMessage();
      };
    };

    setupNotifications();

  }, [areServicesAvailable, user, firestore, firebaseApp, toast]);
  // --- End of Notification Logic ---


  useEffect(() => {
    if (!areServicesAvailable || isUserLoading) return;

    if (!user && !isUnauthenticatedRoute && !isLandingPage) {
      router.push('/login');
    }

    if (user && (isLandingPage || pathname === '/login')) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, areServicesAvailable, isUnauthenticatedRoute, isLandingPage, router, pathname]);

  if (isUserLoading || (!user && !isUnauthenticatedRoute && !isLandingPage) || (user && (isLandingPage || pathname === '/login'))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if ((isLandingPage && !user) || isUnauthenticatedRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col md:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]:md:pl-[var(--sidebar-width)] transition-[padding-left] duration-200 ease-linear min-h-screen">
          <AppHeader />
          <main className="flex-1 p-6 md:p-8 lg:p-10">
              {children}
          </main>
          <AppFooter />
        </div>
    </SidebarProvider>
  );
}
