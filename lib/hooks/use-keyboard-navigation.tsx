"use client";

import * as React from "react";

/**
 * Hook for keyboard navigation enhancements
 * Provides utilities for common keyboard interactions
 */
export function useKeyboardNavigation() {
  const handleEscape = React.useCallback((callback: () => void) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleArrowKeys = React.useCallback(
    (
      callback: (direction: "up" | "down" | "left" | "right") => void,
      options?: { preventDefault?: boolean }
    ) => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowUp") {
          if (options?.preventDefault) e.preventDefault();
          callback("up");
        } else if (e.key === "ArrowDown") {
          if (options?.preventDefault) e.preventDefault();
          callback("down");
        } else if (e.key === "ArrowLeft") {
          if (options?.preventDefault) e.preventDefault();
          callback("left");
        } else if (e.key === "ArrowRight") {
          if (options?.preventDefault) e.preventDefault();
          callback("right");
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    },
    []
  );

  const handleEnterOrSpace = React.useCallback((callback: () => void) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    handleEscape,
    handleArrowKeys,
    handleEnterOrSpace,
  };
}

/**
 * Hook for focus trap within a container
 * Useful for modals and drawers
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean
) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [isActive, containerRef]);
}
