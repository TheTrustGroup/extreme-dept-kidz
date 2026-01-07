"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/lib/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";

/**
 * ScrollReveal Component
 * 
 * Wrapper component that reveals content on scroll with fade-in animation.
 * Subtle, premium animation that enhances the user experience.
 */
export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
  direction?: "up" | "down" | "left" | "right";
}

const directionVariants = {
  up: { y: 20 },
  down: { y: -20 },
  left: { x: 20 },
  right: { x: -20 },
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.2,
  once = true,
  direction = "up",
}: ScrollRevealProps): JSX.Element {
  const { ref, isInView } = useScrollAnimation({
    threshold,
    once,
    delay,
  });

  const initialOffset = directionVariants[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...initialOffset }}
      animate={
        isInView
          ? {
              opacity: 1,
              x: 0,
              y: 0,
            }
          : { opacity: 0, ...initialOffset }
      }
      transition={{
        duration: 0.4,
        ease: "easeInOut",
        delay,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

