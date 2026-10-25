import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyApiKeyPlaceholder123456",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "olexty-community.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "olexty-community",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "olexty-community.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();