"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const containerClasses = { sm: "w-12 h-6", md: "w-14 h-7", lg: "w-16 h-8" };
const sizeClasses = { sm: "w-5 h-5", md: "w-6 h-6", lg: "w-7 h-7" };
const knobX = { sm: { light: 2, dark: 20 }, md: { light: 2, dark: 28 }, lg: { light: 2, dark: 36 } };

/**
 * ThemeToggle — Smooth light/dark switch, no visibility or layout issues.
 * Placeholder matches button size to prevent CLS; respects reduced motion.
 */
export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "relative rounded-full bg-cream-200 p-1 inline-block",
          containerClasses[size],
          className
        )}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "relative rounded-full inline-flex items-center overflow-visible",
        "transition-colors duration-300 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-navy-500 dark:focus-visible:ring-accent-primary dark:focus-visible:ring-offset-dark-bg-primary",
        isDark ? "bg-dark-surface" : "bg-cream-200",
        containerClasses[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: prefersReducedMotion ? 0.05 : 0.2, ease: "easeOut" }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      type="button"
    >
      <span className="sr-only">{isDark ? "Switch to light mode" : "Switch to dark mode"}</span>
      {/* Track — smooth color transition with theme */}
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-colors duration-300 ease-out",
          isDark ? "bg-dark-bg-secondary" : "bg-cream-100"
        )}
        aria-hidden="true"
      />
      {/* Knob — smooth slide, reduced motion uses instant */}
      <motion.span
        className={cn(
          "absolute top-0.5 flex items-center justify-center rounded-full border transition-colors duration-300 ease-out",
          isDark
            ? "bg-dark-surface border-dark-border-glass text-accent-primary"
            : "bg-cream-50 border-cream-200 text-charcoal-900",
          sizeClasses[size]
        )}
        initial={false}
        animate={{ x: isDark ? knobX[size].dark : knobX[size].light }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 500, damping: 30 }
        }
        aria-hidden="true"
      >
        {isDark ? (
          <Moon className={cn("w-3.5 h-3.5", size === "lg" && "w-4 h-4")} strokeWidth={2} />
        ) : (
          <Sun className={cn("w-3.5 h-3.5", size === "lg" && "w-4 h-4")} strokeWidth={2} />
        )}
      </motion.span>
    </motion.button>
  );
}
