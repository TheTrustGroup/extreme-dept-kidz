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
 * SSR-safe: Theme is applied via inline script in layout.tsx before React hydration.
 * This component only manages theme state after hydration to prevent mismatches.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe: Always start with "light" theme (matches server render)
  // The inline script in layout.tsx applies the correct theme before hydration
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount (after hydration)
  // The inline script already applied the theme, so we just sync state
  useEffect(() => {
    setMounted(true);
    
    // Read theme from DOM (set by inline script) or localStorage
    const getInitialTheme = (): Theme => {
      // Check data-theme attribute (set by inline script)
      if (typeof document !== "undefined") {
        const dataTheme = document.documentElement.getAttribute("data-theme");
        if (dataTheme === "dark" || dataTheme === "light") {
          return dataTheme as Theme;
        }
      }
      
      // Fallback to localStorage
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored === "dark" || stored === "light") {
          return stored;
        }
        
        // Fallback to system preference
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return systemPrefersDark ? "dark" : "light";
      }
      
      return "light";
    };

    const initialTheme = getInitialTheme();
    if (initialTheme !== theme) {
      setThemeState(initialTheme);
      // Ensure DOM matches state (handles edge cases)
      applyTheme(initialTheme);
    }
  }, [theme]);

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
