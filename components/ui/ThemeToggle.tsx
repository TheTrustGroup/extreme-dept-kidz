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

/**
 * ThemeToggle Component
 * 
 * Premium theme switcher with smooth animations.
 * Toggles between dark (primary) and light (secondary) themes.
 */
export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch
    return (
      <div
        className={cn(
          "relative rounded-full bg-cream-200 p-1",
          size === "sm" && "w-12 h-6",
          size === "md" && "w-14 h-7",
          size === "lg" && "w-16 h-8",
          className
        )}
        aria-label="Theme toggle"
      />
    );
  }

  const isDark = theme === "dark";

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const containerClasses = {
    sm: "w-12 h-6",
    md: "w-14 h-7",
    lg: "w-16 h-8",
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "relative rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
        isDark
          ? "bg-dark-surface border-dark-border-glass"
          : "bg-cream-200 border-cream-300",
        containerClasses[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
    >
      {/* Toggle Track */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full flex items-center transition-colors duration-300",
          isDark ? "bg-dark-bg-secondary" : "bg-cream-100"
        )}
      />

      {/* Icon Container */}
      <motion.div
        className={cn(
          "absolute top-0.5 flex items-center justify-center rounded-full",
          "backdrop-blur-sm border transition-colors duration-300",
          isDark
            ? "bg-dark-surface border-dark-border-glass text-accent-primary shadow-dark-soft"
            : "bg-cream-50 border-cream-200 text-charcoal-900 shadow-glass",
          sizeClasses[size]
        )}
        initial={false}
        animate={{
          x: isDark
            ? size === "sm"
              ? 20
              : size === "md"
                ? 28
                : 36
            : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className={cn("w-3.5 h-3.5", size === "lg" && "w-4 h-4")} />
        ) : (
          <Sun className={cn("w-3.5 h-3.5", size === "lg" && "w-4 h-4")} />
        )}
      </motion.div>

      {/* Icons on track */}
      <div className="relative h-full flex items-center justify-between px-1.5 pointer-events-none">
        <Sun
          className={cn(
            "transition-opacity duration-300",
            isDark ? "opacity-30" : "opacity-100",
            sizeClasses[size],
            isDark ? "text-dark-text-muted" : "text-charcoal-600"
          )}
        />
        <Moon
          className={cn(
            "transition-opacity duration-300",
            isDark ? "opacity-100" : "opacity-30",
            sizeClasses[size],
            isDark ? "text-accent-primary" : "text-charcoal-400"
          )}
        />
      </div>
    </motion.button>
  );
}
