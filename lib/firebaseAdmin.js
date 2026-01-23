import admin from "firebase-admin";

let app;

/**
 * Lazily initialize Firebase Admin
 * (Prevents Vercel build-time crashes)
 */
export function getAdminApp() {
  if (!app) {
    if (!admin.apps.length) {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
            : undefined,
        }),
      });
    } else {
      app = admin.app();
    }
  }
  return app;
}

/**
 * Firestore getter (safe)
 */
export function getAdminDb() {
  return getAdminApp().firestore();
}