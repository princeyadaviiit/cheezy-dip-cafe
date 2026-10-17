import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "pill" | "card";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  ...props
}) => {
  const variantStyles = {
    rectangular: "rounded-[var(--r-input)]",
    circular: "rounded-full aspect-square",
    pill: "rounded-[var(--r-pill)]",
    card: "rounded-[var(--r-card)]",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--bg-raised)]/90 border border-[var(--border)]/40",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};
