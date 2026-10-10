import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    const variants = {
      default: "bg-[#0B1B22] text-white hover:bg-black shadow-sm",
      outline: "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
      ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-11 px-6 text-sm",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
