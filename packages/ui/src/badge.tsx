import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// Badge — Status badges for orders, fiscal docs, etc.
// ─────────────────────────────────────────────────────────────

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";
  size?: "sm" | "md";
}

const badgeVariants: Record<string, string> = {
  default:
    "bg-charcoal-100 text-charcoal-700 border-charcoal-200",
  success:
    "bg-sage-100 text-sage-700 border-sage-300",
  warning:
    "bg-amber-100 text-amber-700 border-amber-300",
  danger:
    "bg-rose-100 text-rose-700 border-rose-300",
  info:
    "bg-blue-100 text-blue-700 border-blue-300",
  neutral:
    "bg-paper-100 text-charcoal-500 border-paper-300",
};

const badgeSizes: Record<string, string> = {
  sm: "px-1.5 py-0.5 text-[0.6875rem]",
  md: "px-2.5 py-1 text-pos-sm",
};

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium font-body rounded-tag border",
        "whitespace-nowrap leading-none",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
