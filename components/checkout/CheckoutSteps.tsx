"use client";

import * as React from "react";
import { m } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

export type CheckoutStep = "shipping" | "payment" | "review";

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
  className?: string;
}

const STEPS: Array<{ id: CheckoutStep; label: string; description: string }> = [
  { id: "shipping", label: "Shipping", description: "Delivery information" },
  { id: "payment", label: "Payment", description: "Payment method" },
  { id: "review", label: "Review", description: "Order summary" },
];

/**
 * CheckoutSteps Component
 * 
 * Visual progress indicator for checkout steps.
 */
export function CheckoutSteps({ currentStep, className }: CheckoutStepsProps): JSX.Element {
  const { theme } = useTheme();
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn("mb-8", className)}>
      {/* Desktop: Horizontal Steps */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                      isCompleted
                        ? "bg-navy-900 border-navy-900 text-cream-50"
                        : isCurrent
                          ? "bg-navy-900 border-navy-900 text-cream-50 ring-4 ring-navy-900/20"
                          : theme === "dark"
                            ? "bg-dark-bg-secondary border-dark-border-glass text-dark-text-muted"
                            : "bg-cream-50 border-cream-300 text-charcoal-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="font-sans text-base font-semibold">{index + 1}</span>
                    )}
                  </div>
                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <div
                      className={cn(
                        "font-sans text-sm font-semibold mb-0.5",
                        isCurrent || isCompleted
                          ? theme === "dark"
                            ? "text-dark-text-primary"
                            : "text-charcoal-900"
                          : theme === "dark"
                            ? "text-dark-text-muted"
                            : "text-charcoal-400"
                      )}
                    >
                      {step.label}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        isCurrent || isCompleted
                          ? theme === "dark"
                            ? "text-dark-text-secondary"
                            : "text-charcoal-600"
                          : theme === "dark"
                            ? "text-dark-text-muted"
                            : "text-charcoal-400"
                      )}
                    >
                      {step.description}
                    </div>
                  </div>
                </div>
              </div>
              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 relative">
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-300",
                      index < currentStepIndex
                        ? "bg-navy-900"
                        : theme === "dark"
                          ? "bg-dark-border-glass"
                          : "bg-cream-300"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: Simplified Steps */}
      <div className="md:hidden flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 flex-shrink-0",
                    isCompleted
                      ? "bg-navy-900 border-navy-900 text-cream-50"
                      : isCurrent
                        ? "bg-navy-900 border-navy-900 text-cream-50"
                        : theme === "dark"
                          ? "bg-dark-bg-secondary border-dark-border-glass text-dark-text-muted"
                          : "bg-cream-50 border-cream-300 text-charcoal-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="font-sans text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                {isCurrent && (
                  <span
                    className={cn(
                      "ml-2 font-sans text-sm font-semibold",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}
                  >
                    {step.label}
                  </span>
                )}
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight
                  className={cn(
                    "w-4 h-4 mx-2 flex-shrink-0",
                    index < currentStepIndex
                      ? theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-charcoal-900"
                      : theme === "dark"
                        ? "text-dark-text-muted"
                        : "text-charcoal-400"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
