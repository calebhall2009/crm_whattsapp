import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// Toast — Notification system
// ─────────────────────────────────────────────────────────────

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose?: () => void;
  className?: string;
}

const toastVariants: Record<string, string> = {
  success: "bg-sage-50 border-sage-300 text-sage-800",
  error: "bg-rose-50 border-rose-300 text-rose-800",
  info: "bg-charcoal-50 border-charcoal-300 text-charcoal-800",
  warning: "bg-amber-50 border-amber-300 text-amber-800",
};

const toastIcons: Record<string, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

export function Toast({
  message,
  type = "info",
  onClose,
  className,
}: ToastProps) {
  return (
    <div
      role="alert"
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-card border",
        "font-body text-pos-base shadow-card",
        "motion-safe:animate-slide-up",
        toastVariants[type],
        className
      )}
    >
      <span className="text-lg font-bold" aria-hidden="true">
        {toastIcons[type]}
      </span>
      <p className="flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      )}
    </div>
  );
}
