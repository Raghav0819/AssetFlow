import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type User as FirebaseUser,
} from "firebase/auth";
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  isMockAuth,
} from "../firebase/config";
import { api, ApiClientError, clearStoredToken, setStoredToken } from "../api/client";
import type { Role, SignupRequest } from "../types";

// ─── Context shape ───

interface AuthState {
  firebaseUser: FirebaseUser | null;
  role: Role | null;
  userName: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ───

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    role: null,
    userName: null,
    loading: true,
  });

  // While an explicit login()/signup() call is in flight, it already owns setting
  // the final auth state — the onAuthStateChanged listener below fires as a side
  // effect of the same sign-in and must not race it with a redundant, token-less
  // api.me() call that would otherwise briefly overwrite it with fallback values.
  const manualAuthInProgress = useRef(false);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (manualAuthInProgress.current) return;
      if (fbUser) {
        try {
          const profile = await api.me();
          setState({
            firebaseUser: fbUser,
            role: profile.role,
            userName: profile.name,
            loading: false,
          });
        } catch (error) {
          if (isMockAuth) {
            console.log("Mock Mode: Backend API offline, using mock profile.");
            setState({
              firebaseUser: fbUser,
              role: "Admin",
              userName: fbUser.displayName || "Guest User",
              loading: false,
            });
          } else {
            // Token valid in Firebase but backend profile missing — treat as logged out
            setState({
              firebaseUser: null,
              role: null,
              userName: null,
              loading: false,
            });
          }
        }
      } else {
        setState({
          firebaseUser: null,
          role: null,
          userName: null,
          loading: false,
        });
      }
    });

    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    manualAuthInProgress.current = true;
    try {
      // 1. Firebase sign-in
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // 2. Backend login to get role + session token
      let role: any = "Admin";
      let name = "Mock User";
      try {
        const res = await api.login({ email, password });
        role = res.role;
        name = res.name;
        setStoredToken(res.access_token);
      } catch (error) {
        // Only fall back to a default identity when the backend is genuinely
        // unreachable — a real 401/403/etc. from the API means bad credentials
        // and must surface as an error, not silently log the user in.
        if (isMockAuth && !(error instanceof ApiClientError)) {
          console.log("Mock Mode: Backend API offline, using default Admin role.");
        } else {
          throw error;
        }
      }

      setState({
        firebaseUser: cred.user,
        role,
        userName: name,
        loading: false,
      });
    } finally {
      manualAuthInProgress.current = false;
    }
  };

  const signup = async (data: SignupRequest) => {
    try {
      // Backend creates Firebase user + Postgres profile in one call
      await api.signup(data);
    } catch (error) {
      if (isMockAuth && !(error instanceof ApiClientError)) {
        console.log("Mock Mode: Backend API offline, bypassing backend registration.");
      } else {
        throw error;
      }
    }
    // After signup, auto-login
    await login(data.email, data.password);
  };

  const logout = async () => {
    await signOut(auth);
    clearStoredToken();
    setState({
      firebaseUser: null,
      role: null,
      userName: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
