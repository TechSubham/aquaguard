import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "critical" | "warning" | "success" | "danger";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-colors";

  const variants = {
    default: "bg-[#0B1B22] text-white",
    secondary: "bg-slate-100 text-slate-700 border border-slate-200",
    outline: "text-slate-700 border border-slate-300 bg-white",
    critical: "bg-red-50 text-red-700 border border-red-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  return <div className={cn(baseStyles, variants[variant], className)} {...props} />;
}
