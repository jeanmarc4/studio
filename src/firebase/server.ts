import { getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebaseAdmin() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      app = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use a config object to initialize
      // during development.
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to empty config.', e);
      }
      // Fallback for local development if GOOGLE_APPLICATION_CREDENTIALS is not set.
      app = initializeApp({});
    }
  } else {
    app = getApp();
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks();
}

export function getSdks() {
  if (!app) {
    app = getApp();
  }
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app)
  };
}
