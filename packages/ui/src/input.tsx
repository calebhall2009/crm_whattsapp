import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// Input — Text, number, search with label & error states
// ─────────────────────────────────────────────────────────────

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-pos-sm font-medium text-charcoal-700 font-body"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full px-3 py-2.5 min-h-[2.75rem]",
            "bg-white border rounded-button font-body text-pos-base text-charcoal-800",
            "placeholder:text-charcoal-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1",
            "transition-colors duration-150",
            error
              ? "border-rose-400 focus-visible:ring-rose-400"
              : "border-charcoal-200 hover:border-charcoal-300",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-charcoal-50",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-pos-sm text-rose-500 font-body"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-pos-sm text-charcoal-400 font-body">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
