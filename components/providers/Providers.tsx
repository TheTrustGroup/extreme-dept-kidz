"use client";

import * as React from "react";
import { CartProvider } from "./CartProvider";
import { CartDrawerProvider } from "@/lib/hooks/use-cart-drawer";
import { LazyMotionProvider } from "./LazyMotion";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "./ThemeProvider";
import { RevealProvider } from "./RevealProvider";
import { CurrencyProvider } from "./CurrencyProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component wrapper for global state management
 * ThemeProvider wraps everything to enable theme switching
 */
export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <ThemeProvider>
      <LazyMotionProvider>
        <ToastProvider>
          <CurrencyProvider>
            <CartProvider>
              <CartDrawerProvider>
                <RevealProvider>{children}</RevealProvider>
              </CartDrawerProvider>
            </CartProvider>
          </CurrencyProvider>
        </ToastProvider>
      </LazyMotionProvider>
    </ThemeProvider>
  );
}
