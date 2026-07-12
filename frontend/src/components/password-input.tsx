"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  className?: string;
  disabled?: boolean;
}

function getStrength(password: string): { level: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return { level: score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { level: score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { level: score, label: "Good", color: "bg-yellow-500" };
  return { level: score, label: "Strong", color: "bg-emerald-500" };
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  showStrength = false,
  className,
  disabled = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const strength = getStrength(value);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Lock
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={18}
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-white text-slate-900",
            "text-sm placeholder:text-slate-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
            "hover:border-slate-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  i <= strength.level ? strength.color : "bg-slate-200"
                )}
              />
            ))}
          </div>
          <p className={cn("text-xs font-medium", strength.color.replace("bg-", "text-"))}>
            {strength.label}
          </p>
        </div>
      )}
    </div>
  );
}
