"use client";

import { useEffect } from 'react';

/**
 * An invisible component that handles the service worker registration.
 */
export function PwaInstaller() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  }, []);

  return null; // This component doesn't render anything.
}
