"use client";

import * as React from "react";
import { m } from "framer-motion";
import {
  Truck,
  RefreshCw,
  ShieldCheck,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    id: "shipping",
    icon: Truck,
    title: "Free shipping",
    description: "On orders over $100",
  },
  {
    id: "returns",
    icon: RefreshCw,
    title: "30-day returns",
    description: "Easy, hassle-free returns",
  },
  {
    id: "checkout",
    icon: ShieldCheck,
    title: "Secure checkout",
    description: "Your data is protected",
  },
  {
    id: "quality",
    icon: Award,
    title: "Premium quality",
    description: "Crafted to last",
  },
] as const;

function TrustFeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}): JSX.Element {
  const Icon = feature.icon;
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      role="listitem"
      className={cn(
        "flex flex-col items-center text-center gap-3 sm:gap-4",
        "px-4 py-6 sm:py-8 rounded-lg",
        "bg-luxury-cream/80 border border-luxury-navy-200/30",
        "hover:border-luxury-gold/40 hover:shadow-md hover:shadow-luxury-navy-900/5",
        "transition-all duration-300"
      )}
    >
      <m.div
        className={cn(
          "flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full",
          "bg-luxury-navy/8 text-luxury-gold border border-luxury-navy-200/20"
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />
      </m.div>
      <div className="space-y-1">
        <h3
          className={cn(
            "text-sm sm:text-base font-semibold text-luxury-navy tracking-tight",
            "font-[family-name:var(--font-playfair),'Playfair_Display',Georgia,serif]"
          )}
        >
          {feature.title}
        </h3>
        <p className="text-xs sm:text-sm text-luxury-navy-700/90">
          {feature.description}
        </p>
      </div>
    </m.div>
  );
}

/**
 * TrustSection — trust/features strip for the homepage.
 * Four features with icons + text; 4 cols desktop, 2 tablet, 1 mobile; subtle animations.
 */
export function TrustSection(): JSX.Element {
  return (
    <section
      className="section-padding bg-luxury-cream border-y border-luxury-navy-200/20"
      aria-label="Trust and value propositions"
    >
      <div className="container-luxury">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          role="list"
        >
          {FEATURES.map((feature, index) => (
            <TrustFeatureCard
              key={feature.id}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
