"use client";

import * as React from "react";

/**
 * useReveal Hook
 * 
 * Intersection Observer hook for reveal animations.
 * Adds 'visible' class to elements when they enter the viewport.
 */
export function useReveal() {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "-50px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isVisible };
}

/**
 * Reveal Component
 * 
 * Wrapper component that adds reveal animation to children.
 */
interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

export function Reveal({ children, className }: RevealProps) {
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`reveal ${isVisible ? "visible" : ""} ${className || ""}`}
    >
      {children}
    </div>
  );
}
