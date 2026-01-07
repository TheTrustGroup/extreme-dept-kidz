"use client";

import * as React from "react";
import { LazyMotion, domAnimation } from "framer-motion";

interface LazyMotionProviderProps {
  children: React.ReactNode;
}

/**
 * LazyMotion Provider
 * 
 * Reduces Framer Motion bundle size by loading only necessary animations
 */
export function LazyMotionProvider({ children }: LazyMotionProviderProps): JSX.Element {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

