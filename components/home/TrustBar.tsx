"use client";

import * as React from "react";
import { RefreshCw, Shield, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";

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
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className="flex-shrink-0 text-forest-600">
        {icon}
      </div>
      <span className="font-sans text-xs sm:text-sm font-medium text-charcoal-900 whitespace-nowrap">
        {text}
      </span>
    </div>
  );
}

export function TrustBar(): JSX.Element {
  return (
    <section
      className="bg-cream-100/90 backdrop-blur-sm border-y border-cream-200/70 py-4 sm:py-5 shadow-sm"
      aria-label="Trust signals and value propositions"
    >
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 md:gap-12 lg:gap-16">
          <TrustItem
            icon={<RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />}
            text="30-Day Returns"
          />
          <TrustItem
            icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />}
            text="Secure Checkout"
          />
          <TrustItem
            icon={<Lock className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />}
            text="SSL Encrypted"
          />
        </div>
      </Container>
    </section>
  );
}
