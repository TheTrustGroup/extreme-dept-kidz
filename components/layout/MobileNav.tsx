"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, ShoppingBag } from "lucide-react";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  cartItemCount?: number;
}

const navLinks = [
  { label: "Boys", href: "/collections/boys" },
  { label: "Girls", href: "/collections/girls" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MobileNav({
  isOpen,
  onClose,
  cartItemCount = 0,
}: MobileNavProps) {
  const { open: openCart } = useCartDrawer();
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
          {/* Backdrop with blur and dark overlay */}
          <motion.div
            className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-md z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-cream-50 shadow-2xl z-50 focus:outline-none"
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
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <span className="font-serif text-xl font-bold text-charcoal-900">
                  Menu
                </span>
                <button
                  className="p-2 text-charcoal-900 hover:text-navy-900 transition-colors duration-300 rounded-lg hover:bg-cream-200 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                  onClick={onClose}
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-12 overflow-y-auto">
                <ul className="space-y-8">
                  {navLinks.map((link, index) => (
                    <motion.li
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
                        className="block font-serif text-2xl font-semibold text-charcoal-900 hover:text-navy-900 transition-colors duration-300 py-2 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-lg px-2 -mx-2"
                        onClick={onClose}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Footer Actions */}
              <div className="p-6 border-t border-cream-200 space-y-3">
                <Link
                  href="/account"
                  className="flex items-center gap-4 font-sans text-lg font-medium text-charcoal-900 hover:text-navy-900 transition-colors duration-300 w-full focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-lg px-2 -mx-2 py-2"
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
                  className="flex items-center gap-4 font-sans text-lg font-medium text-charcoal-900 hover:text-navy-900 transition-colors duration-300 w-full text-left focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-lg px-2 -mx-2 py-2"
                  aria-label={`View shopping cart with ${cartItemCount} items`}
                >
                  <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                  Cart
                  {cartItemCount > 0 && (
                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-xs font-medium text-cream-50">
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

