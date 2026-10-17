import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] active:scale-[0.98]";

    const sizeStyles = {
      sm: "min-h-[36px] px-3 py-1.5 text-xs rounded-[var(--r-input)]",
      md: "min-h-[44px] px-4 py-2.5 text-sm font-semibold rounded-[var(--r-input)]",
      lg: "min-h-[50px] px-6 py-3 text-base font-bold rounded-[var(--r-card)]",
    };

    const variantStyles = {
      primary:
        "bg-[var(--brand-primary)] text-[var(--text-on-brand)] hover:bg-[var(--brand-primary-strong)] active:bg-[var(--brand-primary-strong)] shadow-sm",
      secondary:
        "bg-[var(--bg-raised)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] active:bg-[var(--border-strong)]",
      accent:
        "bg-[var(--brand-accent)] text-white hover:brightness-110 active:brightness-95 shadow-sm",
      outline:
        "border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 active:bg-[var(--brand-primary)]/20",
      ghost:
        "text-[var(--text)] hover:bg-[var(--bg-raised)] active:bg-[var(--border)]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
