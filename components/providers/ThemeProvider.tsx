"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Default theme context for SSR - Light theme is primary
const defaultThemeContext: ThemeContextType = {
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

/**
 * ThemeProvider Component
 * 
 * Manages dark/light theme state with localStorage persistence.
 * Light theme is the primary/default theme.
 * 
 * Performance: Prevents FOUC by applying theme synchronously before render
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Performance: Initialize theme synchronously to prevent FOUC
    // This runs only on client-side mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored === "dark" || stored === "light") {
        // Apply immediately to prevent flash
        applyThemeSync(stored);
        return stored;
      }
      // Check system preference, default to light
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme: Theme = systemPrefersDark ? "dark" : "light";
      applyThemeSync(initialTheme);
      return initialTheme;
    }
    return "light";
  });
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount (for SSR hydration)
  useEffect(() => {
    setMounted(true);
    
    // Double-check theme on mount (handles edge cases)
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      if (stored !== theme) {
        setThemeState(stored);
        applyTheme(stored);
      }
    } else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme: Theme = systemPrefersDark ? "dark" : "light";
      if (initialTheme !== theme) {
        setThemeState(initialTheme);
        applyTheme(initialTheme);
      }
    }
  }, []);

  // Apply theme to document synchronously (prevents FOUC)
  function applyThemeSync(newTheme: Theme) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
  }

  // Apply theme to document (async version)
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", newTheme);
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Always render children - theme is applied synchronously to prevent FOUC
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 * 
 * Access theme state and controls
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  // Always return context (has default value for SSR)
  return context;
}
