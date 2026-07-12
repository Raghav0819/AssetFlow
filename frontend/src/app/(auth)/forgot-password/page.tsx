"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === "auth/user-not-found") {
        // Don't reveal whether user exists — still show success
        setSent(true);
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <Toaster position="top-right" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
            <CheckCircle2 className="text-emerald-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Check your email
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto mb-8">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-slate-700">{email}</span>.
            Please check your inbox and follow the instructions.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="w-full h-12 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all duration-200"
            >
              Try a different email
            </button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-sm transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </>
    );
  }

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
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-slate-900 tracking-tight"
        >
          Reset Password
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-2 text-sm text-slate-500 leading-relaxed"
        >
          Enter your email address and we&apos;ll send you a link to reset your password.
        </motion.p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
              autoFocus
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-sm transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Sending...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Send Reset Link
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </button>
      </form>
    </>
  );
}
