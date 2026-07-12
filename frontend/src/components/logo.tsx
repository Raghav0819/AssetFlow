"use client";

import { cn } from "@/lib/utils";
import { Boxes } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  className?: string;
}

const sizeMap = {
  sm: { icon: 20, text: "text-lg", sub: "text-[9px]" },
  md: { icon: 26, text: "text-xl", sub: "text-[10px]" },
  lg: { icon: 34, text: "text-2xl", sub: "text-xs" },
};

export function Logo({ size = "md", variant = "light", className }: LogoProps) {
  const s = sizeMap[size];
  const textColor = variant === "light" ? "text-white" : "text-slate-900";
  const subColor = variant === "light" ? "text-blue-200" : "text-indigo-500";
  const iconBg = variant === "light"
    ? "bg-white/20 border-white/30"
    : "bg-indigo-100 border-indigo-200";
  const iconColor = variant === "light" ? "text-white" : "text-indigo-600";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border backdrop-blur-sm",
          iconBg,
          size === "sm" ? "h-9 w-9" : size === "md" ? "h-11 w-11" : "h-14 w-14"
        )}
      >
        <Boxes className={iconColor} size={s.icon} strokeWidth={1.8} />
      </div>
      <div className="flex flex-col">
        <span className={cn("font-bold tracking-tight leading-none", s.text, textColor)}>
          AssetFlow
        </span>
        <span className={cn("font-semibold tracking-[0.25em] uppercase leading-tight mt-0.5", s.sub, subColor)}>
          Enterprise Resource
        </span>
      </div>
    </div>
  );
}
