"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Spinner } from "./PageLoader";
import { cn } from "@/lib/utils";

/**
 * LoadingOverlay Component
 * 
 * Full-screen or container overlay with loading indicator.
 * Used for blocking UI during async operations.
 */
export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: "fullscreen" | "container";
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  message = "Loading...",
  variant = "container",
  className,
}: LoadingOverlayProps): JSX.Element {
  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "bg-cream-50/80 backdrop-blur-sm z-50 flex items-center justify-center",
            variant === "fullscreen"
              ? "fixed inset-0"
              : "absolute inset-0 rounded-lg",
            className
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            {message && (
              <p className="text-sm text-charcoal-600 font-medium">{message}</p>
            )}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

