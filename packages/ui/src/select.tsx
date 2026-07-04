import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// Select — Dropdown with label and error states
// ─────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-pos-sm font-medium text-charcoal-700 font-body"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "w-full px-3 py-2.5 min-h-[2.75rem]",
            "bg-white border rounded-button font-body text-pos-base text-charcoal-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1",
            "transition-colors duration-150 appearance-none",
            "bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2220%22%20height%3d%2220%22%20viewBox%3d%220%200%2020%2020%22%20fill%3d%22%236b6155%22%3e%3cpath%20d%3d%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%2f%3e%3c%2fsvg%3e')]",
            "bg-[length:1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat pr-8",
            error
              ? "border-rose-400 focus-visible:ring-rose-400"
              : "border-charcoal-200 hover:border-charcoal-300",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-charcoal-50",
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-pos-sm text-rose-500 font-body" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
