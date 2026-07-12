"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PasswordInput } from "@/components/password-input";
import { GoogleButton } from "@/components/social-auth-buttons";
import { motion } from "framer-motion";
import { Mail, User, ArrowRight, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = (): boolean => {
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signup(email, password, name.trim());
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists");
      } else if (code === "auth/weak-password") {
        toast.error("Password is too weak. Use at least 8 characters.");
      } else if (code === "auth/invalid-email") {
        toast.error("Invalid email address");
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code !== "auth/popup-closed-by-user") {
        toast.error("Google sign-up failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
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
          Create Account
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-2 text-sm text-slate-500"
        >
          Start managing enterprise assets in minutes.
        </motion.p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <div className="relative">
            <User
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={18}
            />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={loading}
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Work Email
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
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            showStrength
            disabled={loading}
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter password"
            disabled={loading}
          />
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer select-none leading-relaxed">
            I agree to the{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</a>
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
              Creating account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create Employee Account
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </button>

        {/* Role notice */}
        <p className="text-xs text-center text-slate-400 leading-relaxed">
          All accounts are created as <span className="font-medium text-slate-500">Employee</span> role.
          Elevated roles are assigned by your organization admin.
        </p>
      </form>

      {/* Divider */}
      <div className="relative my-6">
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
      <GoogleButton
        onClick={handleGoogleSignup}
        disabled={loading || googleLoading}
        label="Sign up with Google"
      />

      {/* Login link */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Sign In
        </Link>
      </p>
    </>
  );
}
