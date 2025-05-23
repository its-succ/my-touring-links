import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { firebaseConfig } from './firebase.config';
import { browser, dev } from '$app/environment';
import type { FirebaseApp } from 'firebase/app';

export let app: FirebaseApp;
export let auth: Auth;
export let provider: GoogleAuthProvider;

export const initializeFirebase = () => {
  if (!browser) {
    throw new Error("Can't use the Firebase client on the server.");
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();

    if (dev) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
  }
};
