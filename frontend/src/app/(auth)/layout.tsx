"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import {
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Boxes,
  HardDrive,
  MonitorSmartphone,
} from "lucide-react";

function FloatingOrbs() {
  return (
    <>
      <div className="orb w-[500px] h-[500px] bg-blue-400 -top-40 -left-40 animate-pulse-glow" />
      <div className="orb w-[400px] h-[400px] bg-indigo-300 bottom-20 -right-32 animate-pulse-glow" style={{ animationDelay: "1s" }} />
      <div className="orb w-[300px] h-[300px] bg-violet-400 top-1/2 left-1/4 animate-pulse-glow" style={{ animationDelay: "2s" }} />
    </>
  );
}

function FeatureBadge({ icon: Icon, label, delay }: { icon: React.ElementType; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass flex items-center gap-2.5 px-5 py-3 rounded-xl cursor-default hover:bg-white/15 transition-colors duration-300"
    >
      <Icon size={18} className="text-blue-200" />
      <span className="text-sm font-medium text-white/90">{label}</span>
    </motion.div>
  );
}

function FloatingCard({ icon: Icon, label, value, className, delay }: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={`glass absolute rounded-2xl p-4 cursor-default ${className}`}
      style={{ animation: `float 6s ease-in-out ${delay}s infinite` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="text-blue-200" />
        <span className="text-xs text-white/60 font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function BrandPanel() {
  return (
    <div className="hidden lg:flex relative w-[55%] auth-gradient overflow-hidden">
      <FloatingOrbs />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Top: Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="md" variant="light" />
        </motion.div>

        {/* Center: Hero */}
        <div className="flex-1 flex flex-col justify-center max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white mb-4"
          >
            Command your enterprise assets with{" "}
            <span className="gradient-text">precision.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-blue-100/80 leading-relaxed mb-10 max-w-md"
          >
            A clinical, high-performance ecosystem designed for modern resource management and real-time operational clarity.
          </motion.p>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3">
            <FeatureBadge icon={BarChart3} label="Live Analytics" delay={0.5} />
            <FeatureBadge icon={ShieldCheck} label="Audit Ready" delay={0.6} />
            <FeatureBadge icon={Zap} label="AI Powered" delay={0.7} />
          </div>
        </div>

        {/* Floating stat cards */}
        <FloatingCard
          icon={Boxes}
          label="Total Assets"
          value="12,847"
          className="bottom-48 right-12"
          delay={0.8}
        />
        <FloatingCard
          icon={HardDrive}
          label="Active Now"
          value="8,392"
          className="bottom-80 right-36"
          delay={1.0}
        />
        <FloatingCard
          icon={MonitorSmartphone}
          label="Categories"
          value="64"
          className="bottom-32 right-56"
          delay={1.2}
        />

        {/* Bottom: Testimonial / trust signal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="glass rounded-2xl p-6 max-w-md"
        >
          <div className="flex items-start gap-3">
            <div className="flex -space-x-2">
              {[
                "bg-gradient-to-br from-blue-400 to-indigo-500",
                "bg-gradient-to-br from-emerald-400 to-teal-500",
                "bg-gradient-to-br from-orange-400 to-rose-500",
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${bg} border-2 border-white/20 flex items-center justify-center`}
                >
                  <span className="text-xs font-bold text-white">
                    {["S", "R", "A"][i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/80 leading-relaxed">
                &ldquo;AssetFlow transformed how we manage 10,000+ assets across 12 departments.&rdquo;
              </p>
              <p className="text-xs text-white/50 mt-1.5 font-medium">
                Enterprise Operations Team
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <ArrowUpRight size={14} className="text-emerald-300" />
              <span className="text-sm font-semibold text-emerald-300">34%</span>
              <span className="text-xs text-white/50">efficiency gain</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div>
              <span className="text-sm font-semibold text-white">99.9%</span>
              <span className="text-xs text-white/50 ml-1.5">uptime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex min-h-screen bg-white">
      <BrandPanel />

      {/* Right panel — Auth form */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile logo */}
        <div className="lg:hidden p-6 pb-0">
          <Logo size="sm" variant="dark" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-[420px]"
          >
            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 sm:px-12 lg:px-16">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
            <span className="ml-auto">© 2026 AssetFlow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
