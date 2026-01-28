"use client";

import * as React from "react";
import { RefreshCw, Shield, Lock } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * TrustBar Component
 * 
 * Prominent trust signals displayed below hero section.
 * Builds confidence for first-time visitors with clear value propositions.
 */
interface TrustItemProps {
  icon: React.ReactNode;
  text: string;
}

function TrustItem({ icon, text }: TrustItemProps): JSX.Element {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-center gap-[var(--space-2)] sm:gap-[var(--space-3)]">
      <div className={cn(
        "flex-shrink-0 transition-colors duration-300 flex items-center justify-center",
        theme === "dark" ? "text-accent-primary" : "text-forest-600"
      )}>
        {icon}
      </div>
      <span className={cn(
        "font-sans text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300 text-center",
        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
      )}>
        {text}
      </span>
    </div>
  );
}

export function TrustBar(): JSX.Element {
  const { theme } = useTheme();
  return (
    <section
      className={cn(
        "backdrop-blur-sm border-y shadow-sm transition-colors duration-300",
        "py-[var(--space-4)] sm:py-[var(--space-5)]",
        theme === "dark"
          ? "bg-dark-surface border-dark-border-glass"
          : "bg-cream-100/90 border-cream-200/70"
      )}
      aria-label="Trust signals and value propositions"
    >
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-[var(--space-5)] sm:gap-[var(--space-6)] md:gap-[var(--space-8)] lg:gap-[var(--space-10)]">
          <TrustItem
            icon={<RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />}
            text="30-Day Returns"
          />
          <TrustItem
            icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />}
            text="Secure Checkout"
          />
          <TrustItem
            icon={<Lock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />}
            text="SSL Encrypted"
          />
        </div>
      </Container>
    </section>
  );
}
