import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Initialize Firebase with personal project config and environment variable overrides
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAFuEGtSEWVIDpJxjHoLBjlJLfSHA61zB0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zikr-tracker-d6467.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zikr-tracker-d6467",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zikr-tracker-d6467.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "826391204853",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:826391204853:web:a5921ebac7abfa919146bc",
  measurementId: "G-Z818ZPSS43"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const firestoreDbId =
  import.meta.env.VITE_FIRESTORE_DATABASE_ID ||
  import.meta.env.VITE_FIREBASE_DATABASE_ID;

// Use the designated Firestore Database ID if specified via env, otherwise standard default
export const db = firestoreDbId && firestoreDbId !== '(default)'
  ? getFirestore(app, firestoreDbId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Test connection on boot per Firebase specification
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

export { onAuthStateChanged };
export type { User };
