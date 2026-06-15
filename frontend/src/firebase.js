import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let app = null;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export const auth = app ? getAuth(app) : null;
export const provider = app ? new GoogleAuthProvider() : null;
export const db = app ? getFirestore(app) : null;

if (auth) {
  setPersistence(auth, inMemoryPersistence).catch((err) =>
    console.error('Failed to set auth persistence:', err)
  );
}
