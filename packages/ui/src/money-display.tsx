import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// MoneyDisplay — Formatted currency with tabular numbers
// The most important component in a POS UI
// ─────────────────────────────────────────────────────────────

export interface MoneyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  currency?: string;
  locale?: string;
  size?: "sm" | "md" | "lg" | "total";
  showSign?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: "text-pos-sm",
  md: "text-pos-base",
  lg: "text-pos-price",
  total: "text-pos-total",
};

export function MoneyDisplay({
  amount,
  currency = "USD",
  locale = "es-EC",
  size = "md",
  showSign = false,
  className,
  ...props
}: MoneyDisplayProps) {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: showSign ? "exceptZero" : "auto",
  }).format(amount);

  return (
    <span
      className={clsx(
        "font-mono tabular-nums tracking-tight",
        sizeClasses[size],
        amount < 0 && "text-rose-500",
        className
      )}
      {...props}
    >
      {formatted}
    </span>
  );
}
