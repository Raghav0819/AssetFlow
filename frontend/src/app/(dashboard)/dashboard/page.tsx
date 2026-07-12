"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getRoleConfig } from "@/lib/roles";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import {
  LogOut,
  Boxes,
  BarChart3,
  Users,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const quickActions = [
  { icon: Boxes, label: "Asset Directory", color: "from-indigo-500 to-blue-500" },
  { icon: BarChart3, label: "Analytics", color: "from-emerald-500 to-teal-500" },
  { icon: Users, label: "Team", color: "from-orange-500 to-rose-500" },
  { icon: ClipboardCheck, label: "Audits", color: "from-violet-500 to-purple-500" },
];

export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  const roleConfig = getRoleConfig(role);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            borderRadius: "12px",
            fontSize: "14px",
            padding: "12px 16px",
          },
        }}
      />

      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" variant="dark" />
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.displayName || "User"}</p>
              <p className={`text-xs font-medium ${roleConfig.textColor}`}>{roleConfig.label}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {firstName[0]?.toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 h-9 px-3 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Demo Mode Banner */}
          {user?.isDemo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm text-emerald-800">
                <span className="font-semibold">Demo Mode</span> — You have full admin access to explore all features.
              </p>
            </motion.div>
          )}

          {/* Welcome */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-indigo-500" />
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-0.5 rounded-full ring-1 ring-inset ${roleConfig.badge}`}>
                {roleConfig.label}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-2 text-slate-500">
              {roleConfig.description}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 text-left transition-all duration-300 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10`}>
                  <action.icon size={20} className="text-white" />
                </div>
                <p className="font-semibold text-slate-900 mb-1">{action.label}</p>
                <p className="text-xs text-slate-400">Coming soon</p>
                <ArrowRight
                  size={16}
                  className="absolute top-6 right-6 text-slate-300 transition-all group-hover:text-slate-500 group-hover:translate-x-0.5"
                />
              </motion.button>
            ))}
          </div>

          {/* Account info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-white border border-slate-200 p-8"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-4">Account Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Name</p>
                <p className="text-sm font-medium text-slate-900">{user?.displayName || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-medium text-slate-900">{user?.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Role</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${roleConfig.badge}`}>
                  {roleConfig.label}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Account ID</p>
                <p className="text-sm font-mono text-slate-500">{user?.uid?.slice(0, 16)}...</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
