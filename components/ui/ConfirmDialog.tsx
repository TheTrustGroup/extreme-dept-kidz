"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps): JSX.Element | null {
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "text-red-600",
      confirmButton: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: "text-yellow-600",
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    info: {
      icon: "text-blue-600",
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            transition={{ duration: 0.2 }}
          />
          {/* Dialog */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "glass max-w-md w-full p-[var(--space-6)] pointer-events-auto",
                "border-radius: var(--radius-lg)"
              )}
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className={cn("w-6 h-6 flex-shrink-0 mt-0.5", styles.icon)} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                  <div className="text-sm text-gray-600 mb-6">
                    {typeof message === 'string' ? <p>{message}</p> : message}
                  </div>
                  {children}
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="ghost"
                      onClick={onCancel}
                      className="text-charcoal-700 hover:text-charcoal-900"
                    >
                      {cancelText}
                    </Button>
                    <Button
                      onClick={onConfirm}
                      className={styles.confirmButton}
                    >
                      {confirmText}
                    </Button>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className="flex-shrink-0 text-charcoal-400 hover:text-charcoal-600 transition-colors p-1"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
