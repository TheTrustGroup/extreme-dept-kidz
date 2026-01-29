"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

interface LoadingSpinnerProps {
  /** Size of spinner */
  size?: "sm" | "md" | "lg";
  /** Custom className */
  className?: string;
  /** Text to display below spinner */
  text?: string;
  /** Full screen overlay */
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

/**
 * LoadingSpinner Component
 * 
 * Reusable spinner for loading states.
 */
export function LoadingSpinner({
  size = "md",
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps): JSX.Element {
  const { theme } = useTheme();

  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2
        className={cn(
          sizeClasses[size],
          "animate-spin",
          theme === "dark" ? "text-accent-primary" : "text-navy-900"
        )}
        aria-label="Loading"
      />
      {text && (
        <p
          className={cn(
            "text-sm",
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
          )}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          theme === "dark" ? "bg-dark-bg-primary/80" : "bg-cream-50/80",
          "backdrop-blur-sm"
        )}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
