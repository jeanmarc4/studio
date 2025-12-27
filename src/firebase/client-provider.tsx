'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';

// This component ensures Firebase is initialized only on the client-side.
export const FirebaseClientProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [services, setServices] = useState<{
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        let app: FirebaseApp;
        if (getApps().length === 0) {
          const response = await fetch('/api/firebase-config');
          if (!response.ok) {
            throw new Error('Failed to fetch Firebase config');
          }
          const config = await response.json();
          app = initializeApp(config);
        } else {
          app = getApp();
        }
        
        const auth = getAuth(app);
        const firestore = getFirestore(app);

        setServices({ firebaseApp: app, auth, firestore });
      } catch (e) {
        console.error("Failed to initialize Firebase on client", e);
        setError(e instanceof Error ? e : new Error("Unknown initialization error"));
      }
    };

    initialize();
  }, []);

  if (error) {
    return <div className="flex h-screen w-full items-center justify-center">Error initializing app. Check console.</div>;
  }
  
  if (!services) {
    // This loading state will be replaced by the one in AuthLayout
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
};
