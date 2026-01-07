"use client";

import * as React from "react";
import { useInView } from "framer-motion";

/**
 * useScrollAnimation Hook
 * 
 * Hook for scroll-triggered animations with fade-in effect.
 * Returns ref and animation variants for Framer Motion.
 */
interface UseScrollAnimationOptions {
  threshold?: number;
  once?: boolean;
  delay?: number;
}

interface UseScrollAnimationReturn {
  ref: React.RefObject<HTMLDivElement>;
  isInView: boolean;
  variants: {
    hidden: { opacity: number; y: number };
    visible: { opacity: number; y: number; transition: { duration: number; ease: string; delay: number } };
  };
}

export function useScrollAnimation(
  options?: UseScrollAnimationOptions
): UseScrollAnimationReturn {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    amount: options?.threshold ?? 0.2,
  });

  const variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        delay: options?.delay ?? 0,
      },
    },
  };

  return {
    ref,
    isInView,
    variants,
  };
}

