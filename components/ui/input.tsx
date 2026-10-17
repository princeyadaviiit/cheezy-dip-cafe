import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full min-h-[44px] px-3.5 py-2.5 text-base md:text-sm bg-[var(--bg-raised)] text-[var(--text)] border rounded-[var(--r-input)] transition-colors placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:ring-1",
            error
              ? "border-[var(--status-problem)] focus:border-[var(--status-problem)] focus:ring-[var(--status-problem)]"
              : "border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-[var(--status-problem)]">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
