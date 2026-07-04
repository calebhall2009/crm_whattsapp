import React from "react";
import { clsx } from "clsx";

// ─────────────────────────────────────────────────────────────
// Modal — Accessible dialog with focus trap
// ─────────────────────────────────────────────────────────────

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={clsx(
        "backdrop:bg-charcoal-900/50 backdrop:backdrop-blur-sm",
        "bg-white rounded-card shadow-terminal",
        "p-0 w-full",
        "motion-safe:animate-slide-up",
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100">
        <h2 className="font-display text-pos-lg font-semibold text-charcoal-800">
          {title}
        </h2>
        <button
          onClick={onClose}
          className={clsx(
            "p-1.5 rounded-button text-charcoal-400 hover:text-charcoal-700",
            "hover:bg-charcoal-50 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          )}
          aria-label="Close dialog"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}
