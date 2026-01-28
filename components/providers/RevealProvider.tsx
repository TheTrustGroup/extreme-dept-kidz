"use client";

import * as React from "react";

/**
 * RevealProvider Component
 * 
 * Initializes Intersection Observer for reveal animations.
 * Automatically adds 'visible' class to elements with 'reveal' class when they enter viewport.
 */
export function RevealProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Only run if user prefers motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Add visible class immediately for reduced motion
      document.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Unobserve after animation triggers
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "-50px",
      }
    );

    // Observe all reveal elements
    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
