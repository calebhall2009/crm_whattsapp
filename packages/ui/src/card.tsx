import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// Card — Standard and receipt-paper variants
// ─────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "receipt";
  padding?: "sm" | "md" | "lg" | "none";
}

const paddingClasses: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-card",
        variant === "default" && "bg-white shadow-card border border-charcoal-100",
        variant === "receipt" &&
          "bg-paper-50 shadow-receipt border border-dashed border-charcoal-200",
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ReceiptDivider — Dashed line mimicking receipt tear-off
// ─────────────────────────────────────────────────────────────

export function ReceiptDivider({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "border-t border-dashed border-charcoal-200 my-3",
        className
      )}
      role="separator"
    />
  );
}
