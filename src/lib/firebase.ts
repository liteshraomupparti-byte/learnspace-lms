import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your-api-key-here' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your-project-id'
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);

  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {
      // Analytics not supported in this environment
    });
  }

  if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.info('Connected to Firebase Emulators (Auth: 9099, Firestore: 8080)');
    } catch (e) {
      console.warn('Emulator connection error (may already be initialized):', e);
    }
  }
} else {
  console.warn(
    'Firebase is not configured yet. Please configure your .env file using .env.example values.'
  );
  // Provide dummy/fallback instances to allow components and types to load without uncaught exceptions
  app = getApps().length === 0
    ? initializeApp({
        apiKey: 'demo-api-key',
        authDomain: 'demo-project.firebaseapp.com',
        projectId: 'demo-project',
        appId: 'demo-app-id',
      })
    : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db, analytics };

