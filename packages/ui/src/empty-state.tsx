import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// EmptyState — Actionable empty states, never generic "No data"
// ─────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        "motion-safe:animate-fade-in",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-charcoal-300" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="font-display text-pos-lg font-semibold text-charcoal-800 mb-2">
        {title}
      </h3>
      <p className="font-body text-pos-base text-charcoal-500 max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={clsx(
            "inline-flex items-center gap-2 px-5 py-2.5",
            "bg-amber-400 text-charcoal-900 font-medium font-body",
            "rounded-button transition-colors hover:bg-amber-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
