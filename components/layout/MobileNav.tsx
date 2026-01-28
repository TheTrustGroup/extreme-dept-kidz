"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { X, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  cartItemCount?: number;
}

const navLinks = [
  { label: "BOYS", href: "/collections/boys", isEmphasized: true },
  { label: "NEW ARRIVALS", href: "/collections/new-arrivals" },
  { label: "GIRLS", href: "/collections/girls" },
  { label: "COLLECTIONS", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MobileNav({
  isOpen,
  onClose,
  cartItemCount = 0,
}: MobileNavProps) {
  const { open: openCart } = useCartDrawer();
  const { theme } = useTheme();
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Focus trap implementation
  React.useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousFocusRef.current =
      (document.activeElement as HTMLElement) || null;

    // Focus the drawer when it opens
    const timer = setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector(
        'a, button, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }, 100);

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = drawerRef.current?.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // Trap focus within drawer
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll when drawer is open
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";

      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur and dark overlay - Higher z-index to overlay header */}
          <m.div
            className={cn(
              "fixed inset-0 backdrop-blur-md transition-colors duration-300",
              "z-[1001]",
              theme === "dark"
                ? "bg-dark-bg-primary/60"
                : "bg-charcoal-900/40"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer - Higher z-index than backdrop and header */}
          <m.div
            ref={drawerRef}
            className={cn(
              "fixed top-0 right-0 bottom-0 w-full max-w-md shadow-2xl focus:outline-none transition-colors duration-300",
              "z-[1002]",
              theme === "dark"
                ? "bg-dark-bg-primary"
                : "bg-cream-50"
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 35,
              stiffness: 400,
              mass: 0.8,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className={cn(
                "flex items-center justify-between p-[var(--space-6)] border-b transition-colors duration-300",
                theme === "dark"
                  ? "border-dark-border-glass"
                  : "border-cream-200"
              )}>
                <span className={cn(
                  "font-serif text-xl font-bold transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  Menu
                </span>
                <button
                  className={cn(
                    "p-[var(--space-2)] rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                    theme === "dark"
                      ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                      : "text-charcoal-900 hover:text-navy-900 hover:bg-cream-200 focus:ring-navy-500"
                  )}
                  onClick={onClose}
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-[var(--space-6)] py-[var(--space-12)] overflow-y-auto">
                <ul className="space-y-[var(--space-8)]">
                  {navLinks.map((link, index) => (
                    <m.li
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "block font-serif text-2xl font-semibold transition-colors duration-300 py-[var(--space-2)] focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg px-[var(--space-2)] -mx-[var(--space-2)]",
                          theme === "dark"
                            ? link.isEmphasized
                              ? "text-accent-primary font-bold"
                              : "text-dark-text-primary hover:text-accent-primary"
                            : link.isEmphasized
                              ? "text-navy-900 font-bold"
                              : "text-charcoal-900 hover:text-navy-900",
                          theme === "dark"
                            ? "focus:ring-accent-primary"
                            : "focus:ring-navy-500"
                        )}
                        onClick={onClose}
                      >
                        {link.label}
                      </Link>
                    </m.li>
                  ))}
                </ul>
              </nav>

              {/* Footer Actions */}
              <div className={cn(
                "p-[var(--space-6)] border-t transition-colors duration-300 space-y-[var(--space-3)]",
                theme === "dark"
                  ? "border-dark-border-glass"
                  : "border-cream-200"
              )}>
                <Link
                  href="/account"
                  className={cn(
                    "flex items-center gap-[var(--space-4)] font-sans text-lg font-medium transition-colors duration-300 w-full focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg px-[var(--space-2)] -mx-[var(--space-2)] py-[var(--space-2)]",
                    theme === "dark"
                      ? "text-dark-text-primary hover:text-accent-primary focus:ring-accent-primary"
                      : "text-charcoal-900 hover:text-navy-900 focus:ring-navy-500"
                  )}
                  onClick={onClose}
                >
                  <User className="w-5 h-5" aria-hidden="true" />
                  Account
                </Link>
                <button
                  onClick={() => {
                    onClose();
                    openCart();
                  }}
                  className={cn(
                    "flex items-center gap-[var(--space-4)] font-sans text-lg font-medium transition-colors duration-300 w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg px-[var(--space-2)] -mx-[var(--space-2)] py-[var(--space-2)]",
                    theme === "dark"
                      ? "text-dark-text-primary hover:text-accent-primary focus:ring-accent-primary"
                      : "text-charcoal-900 hover:text-navy-900 focus:ring-navy-500"
                  )}
                  aria-label={`View shopping cart with ${cartItemCount} items`}
                >
                  <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                  Cart
                  {cartItemCount > 0 && (
                    <span className={cn(
                      "ml-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors duration-300",
                      theme === "dark"
                        ? "bg-accent-primary text-dark-bg-primary"
                        : "bg-navy-900 text-cream-50"
                    )}>
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                </button>
                
                {/* Theme Toggle - Bottom of menu with glassmorphism styling */}
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: navLinks.length * 0.08 + 0.2,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className={cn(
                    "flex items-center justify-between pt-[var(--space-4)] border-t transition-colors duration-300",
                    theme === "dark"
                      ? "border-dark-border-glass"
                      : "border-cream-200"
                  )}
                >
                  <span className={cn(
                    "font-sans text-base font-medium transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Theme
                  </span>
                  <div className={cn(
                    "glass p-[var(--space-2)] rounded-lg transition-all duration-300",
                    theme === "dark"
                      ? "bg-dark-surface/50 backdrop-blur-md border-dark-border-glass"
                      : "bg-cream-100/80 backdrop-blur-sm border-cream-200/50"
                  )}>
                    <ThemeToggle size="sm" />
                  </div>
                </m.div>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

