import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword as realSignIn,
  signOut as realSignOut,
  onAuthStateChanged as realOnAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp: any = null;
let firebaseAuth: any = null;
let usingMock = false;

// Mock user class to satisfy interface requirements — reflects whatever email
// was actually submitted, instead of a fixed placeholder identity.
class MockFirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  constructor(email: string) {
    this.uid = `mock-${email.toLowerCase()}`;
    this.email = email;
    this.displayName = email.split("@")[0];
  }
  async getIdToken() {
    return `mock-firebase-token-${this.uid}`;
  }
}

// Minimal mock of Firebase Auth for fallback/development
const mockAuth = {
  currentUser: null as FirebaseUser | null,
  _listeners: [] as Array<(user: FirebaseUser | null) => void>,
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    this._listeners.push(callback);
    // Emit initial state
    setTimeout(() => callback(this.currentUser), 0);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== callback);
    };
  },
  async signInWithEmailAndPassword(email: string) {
    const user = new MockFirebaseUser(email) as unknown as FirebaseUser;
    this.currentUser = user;
    this._listeners.forEach((l) => l(user));
    return { user };
  },
  async signOut() {
    this.currentUser = null;
    this._listeners.forEach((l) => l(null));
  },
};

// Detect if config is missing or using placeholder values
const isConfigValid =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your-api-key" &&
  firebaseConfig.apiKey.trim() !== "";

if (isConfigValid) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    console.log("Firebase Auth initialized successfully.");
  } catch (error) {
    console.warn("Firebase failed to initialize, falling back to mock auth:", error);
    firebaseAuth = mockAuth;
    usingMock = true;
  }
} else {
  console.log("Firebase configuration missing or invalid. Falling back to mock auth.");
  firebaseAuth = mockAuth;
  usingMock = true;
}

export const auth = firebaseAuth as Auth;
export const isMockAuth = usingMock;
export default firebaseApp;

// ─── Unified Wrapper Functions ───

export function onAuthStateChanged(
  authInstance: Auth,
  callback: (user: FirebaseUser | null) => void
) {
  if (usingMock) {
    return mockAuth.onAuthStateChanged(callback);
  }
  return realOnAuthStateChanged(authInstance, callback);
}

export async function signInWithEmailAndPassword(
  authInstance: Auth,
  email: string,
  password: string
) {
  if (usingMock) {
    return mockAuth.signInWithEmailAndPassword(email);
  }
  return realSignIn(authInstance, email, password);
}

export async function signOut(authInstance: Auth) {
  if (usingMock) {
    return mockAuth.signOut();
  }
  return realSignOut(authInstance);
}
