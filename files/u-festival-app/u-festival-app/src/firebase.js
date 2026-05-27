/**
 * firebase.js — Firebase initialisatie voor het CMS
 *
 * HOE INSTELLEN:
 * 1. Ga naar https://console.firebase.google.com
 * 2. Maak een nieuw project aan (bijv. "u-festival-app")
 * 3. Klik op het </> icoon (Web-app toevoegen)
 * 4. Geef de app een naam en klik "Registreer app"
 * 5. Kopieer de firebaseConfig waarden hieronder
 * 6. Ga naar Firestore Database → Maak database aan (testmodus)
 *
 * OF: vul de waarden direct hieronder in.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// ⚠️ Vervang deze placeholder-waarden met jouw echte Firebase-config!
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
}

// Controleer of Firebase geconfigureerd is
export const firebaseConfigured = Boolean(firebaseConfig.projectId)

let app, db

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig)
  db  = getFirestore(app)
}

export { db }
