"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // If not mounted yet, show neutral light mode moon placeholder
  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--r-input)] transition-colors border",
        "bg-[var(--bg-raised)] text-[var(--text)] border-[var(--border)]",
        "hover:bg-[var(--border)] active:scale-95 cursor-pointer",
        size === "sm" ? "p-2 text-xs" : "p-2.5 text-sm",
        className
      )}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-[var(--brand-primary)] animate-in fade-in zoom-in-75 duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--text-muted)] hover:text-[var(--text)] animate-in fade-in zoom-in-75 duration-200" />
      )}
    </button>
  );
}
