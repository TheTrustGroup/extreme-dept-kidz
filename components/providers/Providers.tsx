"use client";

import * as React from "react";
import { CartProvider } from "./CartProvider";
import { CartDrawerProvider } from "@/lib/hooks/use-cart-drawer";
import { LazyMotionProvider } from "./LazyMotion";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component wrapper for global state management
 * Add context providers here as needed (e.g., ThemeProvider, etc.)
 */
export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <LazyMotionProvider>
      <CartProvider>
        <CartDrawerProvider>{children}</CartDrawerProvider>
      </CartProvider>
    </LazyMotionProvider>
  );
}

