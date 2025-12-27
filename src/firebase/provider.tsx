'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ 
  children, 
  firebaseApp, 
  auth, 
  firestore 
}) => {
  const [userState, setUserState] = useState<{
    user: User | null;
    isUserLoading: boolean;
    userError: Error | null;
  }>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUserState({
          user: firebaseUser,
          isUserLoading: false,
          userError: null,
        });
      },
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserState({
          user: null,
          isUserLoading: false,
          userError: error,
        });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo(() => ({
    areServicesAvailable: true,
    firebaseApp,
    auth,
    firestore,
    ...userState,
  }), [firebaseApp, auth, firestore, userState]);
  
  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

export const useAuth = (): Auth => {
  const { auth, areServicesAvailable } = useFirebase();
  if (!areServicesAvailable || !auth) {
    throw new Error("Firebase Auth service is not available.");
  }
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore, areServicesAvailable } = useFirebase();
  if (!areServicesAvailable || !firestore) {
    throw new Error("Firebase Firestore service is not available.");
  }
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp, areServicesAvailable } = useFirebase();
  if (!areServicesAvailable || !firebaseApp) {
    throw new Error("Firebase App instance is not available.");
  }
  return firebaseApp;
};

export const useUser = () => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}
