"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { SUPPORTED_CURRENCIES } from "@/lib/currency/constants";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Currency flag emoji mapping
 * Using emoji flags for clean, native display without external dependencies
 */
const CURRENCY_FLAGS: Record<string, string> = {
  GHS: "🇬🇭", // Ghana
  USD: "🇺🇸", // United States
  EUR: "🇪🇺", // European Union
  GBP: "🇬🇧", // United Kingdom
  CAD: "🇨🇦", // Canada
  NGN: "🇳🇬", // Nigeria
  XOF: "🇸🇳", // West African CFA (Senegal flag as representative)
  ZAR: "🇿🇦", // South Africa
  AUD: "🇦🇺", // Australia
  CHF: "🇨🇭", // Switzerland
};

/**
 * FloatingCurrencySelector
 *
 * Viewport-fixed currency control: bottom-left, always visible, never clipped by layout.
 * Portals to document.body so no ancestor transform/flex can affect position.
 * Respects safe-area insets and prefers-reduced-motion.
 */
export function FloatingCurrencySelector(): JSX.Element {
  const { theme } = useTheme();
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const current = SUPPORTED_CURRENCIES.find((c) => c.code === currency) ?? SUPPORTED_CURRENCIES[0];
  const [mounted, setMounted] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent): void => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark = theme === "dark";

  // Inject only wrapper positioning CSS - do NOT override transforms on children (breaks Menu + Framer Motion)
  React.useEffect(() => {
    const styleId = "floating-currency-selector-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .floating-currency-selector-root {
        position: fixed !important;
        bottom: max(1.5rem, env(safe-area-inset-bottom, 1.5rem)) !important;
        left: max(1.5rem, env(safe-area-inset-left, 1.5rem)) !important;
        right: auto !important;
        top: auto !important;
        z-index: 99999 !important;
        isolation: isolate !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        pointer-events: auto !important;
      }
      @media (max-width: 768px) {
        .floating-currency-selector-root {
          left: 1rem !important;
          bottom: max(1rem, env(safe-area-inset-bottom, 1rem)) !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const content = (
    <div
      className="floating-currency-selector-root"
      data-floating-currency-selector="true"
      style={{
        position: "fixed",
        bottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))",
        left: "max(1.5rem, env(safe-area-inset-left, 1.5rem))",
        right: "auto",
        top: "auto",
        zIndex: 99999,
        isolation: "isolate",
        margin: 0,
        padding: 0,
        overflow: "visible",
        pointerEvents: "auto",
      }}
    >
      <m.div
        initial={prefersReducedMotion ? false : { opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        }
      >
      <Menu as="div" className="relative">
            {({ open }) => (
                <>
                  {/* Main Button */}
                  <MenuButton
                    className={cn(
                      // Base styles - Premium, minimal, clean
                      "group relative flex items-center gap-2.5",
                      "px-4 py-3 rounded-full",
                      "backdrop-blur-xl border",
                      "shadow-lg hover:shadow-xl",
                      "transition-all duration-300 ease-out",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      // Theme-aware colors
                      isDark
                        ? "bg-dark-surface/90 border-dark-border-glass text-dark-text-primary hover:bg-dark-surface focus:ring-accent-primary"
                        : "bg-white/90 border-cream-200/50 text-charcoal-900 hover:bg-white focus:ring-navy-500",
                      // Subtle scale on hover
                      "hover:scale-105 active:scale-95"
                    )}
                    aria-label="Select currency"
                  >
                    {/* Flag */}
                    <span className="text-xl leading-none" aria-hidden="true">
                      {CURRENCY_FLAGS[current.code] || "💱"}
                    </span>
                    
                    {/* Currency Code */}
                    <span className="font-sans text-sm font-medium tracking-tight">
                      {current.code}
                    </span>

                    {/* Subtle indicator */}
                    <m.div
                      className={cn(
                        "w-1 h-1 rounded-full",
                        isDark ? "bg-accent-primary" : "bg-navy-600"
                      )}
                      animate={{ opacity: open ? 0.5 : 1 }}
                      transition={{ duration: 0.2 }}
                      aria-hidden="true"
                    />
                  </MenuButton>

                  {/* Dropdown Menu */}
                  <MenuItems
                    transition
                    className={cn(
                      "absolute bottom-full left-0 mb-3",
                      "min-w-[200px] max-w-[240px]",
                      "rounded-2xl py-2",
                      "backdrop-blur-xl border",
                      "shadow-2xl",
                      "focus:outline-none",
                      isDark
                        ? "bg-dark-surface/95 border-dark-border-glass"
                        : "bg-white/95 border-cream-200/50"
                    )}
                  >
                        <div className="px-2 py-1.5">
                          <div
                            className={cn(
                              "text-xs font-medium uppercase tracking-wider mb-2 px-3",
                              isDark ? "text-dark-text-secondary" : "text-charcoal-500"
                            )}
                          >
                            Select Currency
                          </div>
                          <div className="space-y-0.5">
                            {SUPPORTED_CURRENCIES.map((c) => {
                              const isSelected = c.code === currency;
                              return (
                                <MenuItem key={c.code}>
                                  {({ focus }) => (
                                    <button
                                      type="button"
                                      onClick={() => setCurrency(c.code)}
                                      className={cn(
                                        "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl",
                                        "text-left text-sm font-sans",
                                        "transition-all duration-200",
                                        "focus:outline-none",
                                        // Selected state
                                        isSelected
                                          ? isDark
                                            ? "bg-accent-primary/20 text-accent-primary font-medium"
                                            : "bg-navy-50 text-navy-900 font-medium"
                                          : "",
                                        // Focus/hover state
                                        focus && !isSelected
                                          ? isDark
                                            ? "bg-dark-bg-secondary text-dark-text-primary"
                                            : "bg-cream-100 text-charcoal-900"
                                          : "",
                                        // Default state
                                        !focus && !isSelected
                                          ? isDark
                                            ? "text-dark-text-secondary hover:text-dark-text-primary"
                                            : "text-charcoal-700 hover:text-charcoal-900"
                                          : ""
                                      )}
                                    >
                                      {/* Flag */}
                                      <span className="text-lg leading-none flex-shrink-0" aria-hidden="true">
                                        {CURRENCY_FLAGS[c.code] || "💱"}
                                      </span>
                                      
                                      {/* Currency Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{c.code}</span>
                                          <span
                                            className={cn(
                                              "text-xs",
                                              isSelected
                                                ? isDark
                                                  ? "text-accent-primary/80"
                                                  : "text-navy-600"
                                                : isDark
                                                ? "text-dark-text-muted"
                                                : "text-charcoal-500"
                                            )}
                                          >
                                            {c.symbol}
                                          </span>
                                        </div>
                                        <div
                                          className={cn(
                                            "text-xs truncate",
                                            isSelected
                                              ? isDark
                                                ? "text-accent-primary/70"
                                                : "text-navy-600/80"
                                              : isDark
                                              ? "text-dark-text-muted"
                                              : "text-charcoal-500"
                                          )}
                                        >
                                          {c.name}
                                        </div>
                                      </div>

                                      {/* Selected indicator */}
                                      {isSelected && (
                                        <m.div
                                          className={cn(
                                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                            isDark ? "bg-accent-primary" : "bg-navy-600"
                                          )}
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ duration: 0.2 }}
                                          aria-hidden="true"
                                        />
                                      )}
                                    </button>
                                  )}
                                </MenuItem>
                              );
                            })}
                          </div>
                        </div>
                      </MenuItems>
                </>
            )}
          </Menu>
      </m.div>
    </div>
  );

  if (!mounted || typeof document === "undefined") return <></>;

  const target = document.body;
  if (!target) return <></>;

  // Portal to body so fixed position is relative to viewport; no parent transform/flex can affect it.
  return createPortal(content, target);
}
