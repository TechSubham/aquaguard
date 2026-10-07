import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "critical" | "warning" | "success" | "danger";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none";

  const variants = {
    default: "bg-white text-black border border-white",
    secondary: "bg-zinc-800 text-zinc-200 border border-zinc-700",
    outline: "text-zinc-300 border border-zinc-700",
    critical: "bg-zinc-950 text-white border border-white shadow-[0_0_8px_rgba(255,255,255,0.2)]",
    danger: "bg-zinc-950 text-white border border-white shadow-[0_0_8px_rgba(255,255,255,0.2)]",
    warning: "bg-zinc-950 text-white border border-zinc-400",
    success: "bg-zinc-950 text-white border border-zinc-400",
  };

  return <div className={cn(baseStyles, variants[variant], className)} {...props} />;
}
