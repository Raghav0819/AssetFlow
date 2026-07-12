"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getRoleForEmail, DEMO_USER, type UserRole } from "@/lib/roles";

// ─── Types ───
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  demoLogin: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helper: Firebase User → AuthUser ───
function mapFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isDemo: false,
  };
}

// ─── Provider ───
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>("employee");
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const authUser = mapFirebaseUser(firebaseUser);
        setUser(authUser);
        setRole(getRoleForEmail(firebaseUser.email ?? ""));
      } else {
        // Check if demo user is active (persisted in sessionStorage)
        const demoSession = sessionStorage.getItem("assetflow_demo");
        if (demoSession) {
          setUser({
            uid: DEMO_USER.uid,
            email: DEMO_USER.email,
            displayName: DEMO_USER.displayName,
            photoURL: null,
            isDemo: true,
          });
          setRole(DEMO_USER.role);
        } else {
          setUser(null);
          setRole("employee");
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── Signup (Employee only) ───
  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    const authUser = mapFirebaseUser(credential.user);
    setUser(authUser);
    setRole(getRoleForEmail(email));
  }, []);

  // ─── Email/Password Login ───
  const login = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const authUser = mapFirebaseUser(credential.user);
    setUser(authUser);
    setRole(getRoleForEmail(email));
  }, []);

  // ─── Google Login ───
  const loginWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const authUser = mapFirebaseUser(result.user);
    setUser(authUser);
    setRole(getRoleForEmail(result.user.email ?? ""));
  }, []);

  // ─── Demo Login (no Firebase, full admin access) ───
  const demoLogin = useCallback(() => {
    sessionStorage.setItem("assetflow_demo", "true");
    setUser({
      uid: DEMO_USER.uid,
      email: DEMO_USER.email,
      displayName: DEMO_USER.displayName,
      photoURL: null,
      isDemo: true,
    });
    setRole(DEMO_USER.role);
  }, []);

  // ─── Logout ───
  const logout = useCallback(async () => {
    sessionStorage.removeItem("assetflow_demo");
    if (user?.isDemo) {
      setUser(null);
      setRole("employee");
    } else {
      await signOut(auth);
    }
  }, [user]);

  // ─── Password Reset ───
  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signup,
        login,
        loginWithGoogle,
        demoLogin,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
