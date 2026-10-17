"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type?: "success" | "error" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration || 4000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 left-4 right-4 z-50 flex flex-col items-center gap-2 pointer-events-none sm:left-auto sm:right-6 sm:w-80"
      >
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-[var(--status-ready)] shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-[var(--status-problem)] shrink-0" />,
            info: <Info className="w-5 h-5 text-[var(--status-new)] shrink-0" />,
          };

          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex w-full items-start gap-3 p-3.5 bg-[var(--bg-raised)] border border-[var(--border-strong)] rounded-[var(--r-card)] shadow-[var(--shadow-float)] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
              )}
            >
              {icons[t.type || "info"]}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-[var(--text)]">{t.title}</p>
                {t.message && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
