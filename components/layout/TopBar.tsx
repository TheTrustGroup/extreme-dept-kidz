"use client";

import Link from "next/link";
import { HeadphonesIcon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export function TopBar(): JSX.Element {
  const { theme } = useTheme();
  return (
    <div className={cn(
      "hidden md:block fixed top-0 left-0 right-0 z-[60] h-8 text-xs border-b backdrop-blur-md transition-colors duration-300",
      theme === "dark"
        ? "bg-dark-bg-secondary text-dark-text-secondary border-dark-border-glass shadow-dark-soft"
        : "bg-[var(--brand-text)]/95 text-cream-50 border-charcoal-800/50 shadow-glass" // COLOR SYSTEM NORMALIZATION: Use brand-text
    )}>
      <div className="container h-full max-w-7xl mx-auto">
        <div className="h-full flex items-center justify-between gap-[var(--space-4)]">
          {/* Left Side - Navigation Links - Consistent spacing */}
          <div className="flex items-center gap-[var(--space-4)] sm:gap-[var(--space-6)] lg:gap-[var(--space-6)]">
            <Link
              href="/contact"
              className={cn(
                "flex items-center gap-[var(--space-2)] transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
                theme === "dark"
                  ? "hover:text-dark-text-primary focus:ring-accent-primary focus:ring-offset-dark-bg-primary"
                  : "hover:text-cream-200 focus:ring-cream-200/50 focus:ring-offset-charcoal-900"
              )}
              aria-label="Customer Care"
            >
              <HeadphonesIcon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Customer Care</span>
            </Link>
            {/* TODO: Track Order link removed until order tracking functionality is fully implemented */}
          </div>

          {/* Right Side - Brand Tagline */}
          <div className={cn(
            "text-[10px] sm:text-xs font-medium whitespace-nowrap transition-opacity duration-300",
            theme === "dark" ? "text-dark-text-muted" : "text-cream-200/80"
          )}>
            Premium Streetwear for Young Legends
          </div>
        </div>
      </div>
    </div>
  );
}
