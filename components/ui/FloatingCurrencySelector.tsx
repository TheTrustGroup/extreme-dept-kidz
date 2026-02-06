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
 * Currency flag emoji mapping — clean, native display without external deps.
 */
const CURRENCY_FLAGS: Record<string, string> = {
  GHS: "🇬🇭",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  CAD: "🇨🇦",
  NGN: "🇳🇬",
  XOF: "🇸🇳",
  ZAR: "🇿🇦",
  AUD: "🇦🇺",
  CHF: "🇨🇭",
};

const GLOBAL_UTILITY_LAYER_ID = "global-utility-layer";
const FOOTER_ID = "footer";

/**
 * CurrencyUtilityPill
 *
 * Sticky utility pill mounted in #global-utility-layer (above footer in DOM).
 * Shown only when the footer enters view; otherwise hidden. This avoids
 * viewport-fixed positioning, which was broken by body { contain: layout style paint }
 * in globals.css (fixed elements were contained by body and scrolled with the page).
 *
 * Placement: Full-width on mobile, left-aligned, thumb-reachable (min 44px touch target).
 * Does not overlap content, iOS back gesture, cookie banner, or chat widgets.
 * Currency persists via zustand persist (currency-store).
 */
export function FloatingCurrencySelector(): JSX.Element {
  const { theme } = useTheme();
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const current = SUPPORTED_CURRENCIES.find((c) => c.code === currency) ?? SUPPORTED_CURRENCIES[0];
  const [mounted, setMounted] = React.useState(false);
  const [footerInView, setFooterInView] = React.useState(false);
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

  // Show pill only when footer enters view — no viewport-fixed, no overlap with content/gestures.
  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const footer = document.getElementById(FOOTER_ID);
    if (!footer) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setFooterInView(entry?.isIntersecting ?? false);
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );
    io.observe(footer);
    return () => io.disconnect();
  }, [mounted]);

  const isDark = theme === "dark";

  const content = (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 z-[9998]",
        "w-full px-4 py-3 md:px-6",
        "flex justify-start items-center"
      )}
      data-currency-utility-pill="true"
      data-visible={footerInView}
      style={{
        minHeight: footerInView ? 44 : 0,
        paddingTop: footerInView ? 12 : 0,
        paddingBottom: footerInView
          ? "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))"
          : 0,
        paddingLeft: "max(1rem, env(safe-area-inset-left, 1rem))",
        opacity: footerInView ? 1 : 0,
        pointerEvents: footerInView ? "auto" : "none",
        visibility: footerInView ? "visible" : "hidden",
        transition: prefersReducedMotion
          ? "none"
          : "opacity 0.25s ease-out, visibility 0.25s ease-out, min-height 0.2s ease-out",
      }}
      aria-hidden={!footerInView}
    >
      <m.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{
          opacity: footerInView ? 1 : 0,
          y: footerInView ? 0 : 8,
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
        className="w-full max-w-full md:max-w-[280px]"
      >
        <Menu as="div" className="relative">
          {({ open }) => (
            <>
              <MenuButton
                className={cn(
                  "group relative flex items-center gap-2.5 w-full md:w-auto justify-start",
                  "min-h-[44px] px-4 py-3 rounded-full",
                  "backdrop-blur-xl border",
                  "shadow-lg hover:shadow-xl",
                  "transition-all duration-300 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isDark
                    ? "bg-dark-surface/90 border-dark-border-glass text-dark-text-primary hover:bg-dark-surface focus:ring-accent-primary"
                    : "bg-white/90 border-cream-200/50 text-charcoal-900 hover:bg-white focus:ring-navy-500",
                  "hover:scale-[1.02] active:scale-[0.98]"
                )}
                aria-label="Select currency"
              >
                <span className="text-xl leading-none flex-shrink-0" aria-hidden="true">
                  {CURRENCY_FLAGS[current.code] || "💱"}
                </span>
                <span className="font-sans text-sm font-medium tracking-tight">
                  {current.code}
                </span>
                <m.div
                  className={cn(
                    "w-1 h-1 rounded-full flex-shrink-0",
                    isDark ? "bg-accent-primary" : "bg-navy-600"
                  )}
                  animate={{ opacity: open ? 0.5 : 1 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden="true"
                />
              </MenuButton>

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
                                "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl min-h-[44px]",
                                "text-left text-sm font-sans",
                                "transition-all duration-200",
                                "focus:outline-none",
                                isSelected
                                  ? isDark
                                    ? "bg-accent-primary/20 text-accent-primary font-medium"
                                    : "bg-navy-50 text-navy-900 font-medium"
                                  : "",
                                focus && !isSelected
                                  ? isDark
                                    ? "bg-dark-bg-secondary text-dark-text-primary"
                                    : "bg-cream-100 text-charcoal-900"
                                  : "",
                                !focus && !isSelected
                                  ? isDark
                                    ? "text-dark-text-secondary hover:text-dark-text-primary"
                                    : "text-charcoal-700 hover:text-charcoal-900"
                                  : ""
                              )}
                            >
                              <span
                                className="text-lg leading-none flex-shrink-0"
                                aria-hidden="true"
                              >
                                {CURRENCY_FLAGS[c.code] || "💱"}
                              </span>
                              <div className="flex-1 min-w-0 text-left">
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

  const target =
    document.getElementById(GLOBAL_UTILITY_LAYER_ID) ?? document.body;
  return createPortal(content, target);
}
