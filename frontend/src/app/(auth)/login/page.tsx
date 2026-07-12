"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PasswordInput } from "@/components/password-input";
import { GoogleButton } from "@/components/social-auth-buttons";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, Zap, Shield } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const { login, loginWithGoogle, demoLogin } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        toast.error("Invalid email or password");
      } else if (code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoLogin = () => {
    demoLogin();
    toast.success("Welcome to the demo!");
    router.push("/dashboard");
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            borderRadius: "12px",
            fontSize: "14px",
            padding: "12px 16px",
          },
        }}
      />

      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-slate-900 tracking-tight"
        >
          Sign In
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-2 text-sm text-slate-500"
        >
          Access your enterprise resource dashboard.
        </motion.p>
      </div>

      {/* Demo Login */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <button
          type="button"
          onClick={handleDemoLogin}
          className="group relative w-full h-13 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] overflow-hidden"
        >
          <span className="flex items-center justify-center gap-2.5">
            <Zap size={18} className="fill-current" />
            Demo Login — Full Access
          </span>
          <span className="absolute -right-1 -top-1 flex items-center gap-1 px-2 py-0.5 rounded-bl-lg bg-white/20 text-[10px] font-bold uppercase tracking-wider">
            <Shield size={10} />
            Admin
          </span>
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          Instant access · No credentials needed · Full admin privileges
        </p>
      </motion.div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-slate-400 font-medium uppercase tracking-wider">
            Or sign in with credentials
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={18}
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              disabled={loading}
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            disabled={loading}
          />
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2.5">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
            Remember this device
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-sm transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-slate-400 font-medium uppercase tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google */}
      <GoogleButton onClick={handleGoogleLogin} disabled={loading || googleLoading} />

      {/* Signup link */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Create Account
        </Link>
      </p>
    </>
  );
}
