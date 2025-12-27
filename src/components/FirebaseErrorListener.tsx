'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It uses an error state and a useEffect hook to throw the error, ensuring
 * it's caught by Next.js's error boundary (global-error.tsx) in a way
 * that is compatible with the build process.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // The callback now expects a strongly-typed error.
    const handleError = (error: FirestorePermissionError) => {
      setError(error);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  // This component renders nothing.
  return null;
}
