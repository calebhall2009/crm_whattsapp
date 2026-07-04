import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// Button — Primary, secondary, ghost, danger variants
// Touch-friendly with visible focus ring
// ─────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-charcoal-800 text-white hover:bg-charcoal-700 active:bg-charcoal-900 border-charcoal-800",
  secondary:
    "bg-amber-400 text-charcoal-900 hover:bg-amber-300 active:bg-amber-500 border-amber-400",
  ghost:
    "bg-transparent text-charcoal-700 hover:bg-charcoal-50 active:bg-charcoal-100 border-transparent",
  danger:
    "bg-rose-400 text-white hover:bg-rose-500 active:bg-rose-600 border-rose-400",
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-pos-sm min-h-[2rem]",
  md: "px-4 py-2.5 text-pos-base min-h-[2.75rem]",
  lg: "px-6 py-3 text-pos-lg min-h-[3.25rem]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-body font-medium",
        "rounded-button border transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "motion-safe:active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
