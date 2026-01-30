"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { X, User, ShoppingBag, Search, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";
import { InstagramIcon, TikTokIcon, SnapchatIcon } from "@/components/ui/social-icons";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  cartItemCount?: number;
  onSearchOpen?: () => void;
}

const navLinks = [
  { label: "ALL", href: "/collections/all" },
  { label: "BOYS", href: "/collections/boys", isEmphasized: true },
  { label: "NEW ARRIVALS", href: "/collections/new-arrivals" },
  { label: "GIRLS", href: "/collections/girls" },
  { label: "COLLECTIONS", href: "/collections" },
];

const socialLinks = [
  { 
    href: "https://www.instagram.com/extreme_dept_kidz?igsh=bm92Zng4OGRyN3Fl", 
    icon: InstagramIcon, 
    label: "Instagram" 
  },
  { 
    href: "https://www.tiktok.com/@extreme_dept_kidz?_r=1&_t=ZM-92wJ2AMJUoS", 
    icon: TikTokIcon, 
    label: "TikTok" 
  },
  { 
    href: "https://snapchat.com/t/dE3hKeZX", 
    icon: SnapchatIcon, 
    label: "Snapchat" 
  },
];

export function MobileNav({
  isOpen,
  onClose,
  cartItemCount = 0,
  onSearchOpen,
}: MobileNavProps) {
  const pathname = usePathname();
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
                "flex items-center justify-between p-[var(--space-4)] sm:p-[var(--space-5)] border-b transition-colors duration-300 flex-shrink-0",
                theme === "dark"
                  ? "border-dark-border-glass"
                  : "border-cream-200"
              )}>
                <span className={cn(
                  "font-serif text-lg sm:text-xl font-bold transition-colors duration-300",
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
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Quick Actions - Account, Cart, Search, Theme - Always visible at top */}
              <div className={cn(
                "px-[var(--space-4)] sm:px-[var(--space-5)] py-[var(--space-3)] border-b transition-colors duration-300 flex-shrink-0",
                theme === "dark"
                  ? "border-dark-border-glass"
                  : "border-cream-200"
              )}>
                <div className="grid grid-cols-4 gap-[var(--space-2)]">
                  {/* Account */}
                  <Link
                    href="/account"
                    className={cn(
                      "flex flex-col items-center gap-[var(--space-1)] p-[var(--space-2)] rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      theme === "dark"
                        ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                        : "text-charcoal-900 hover:text-navy-900 hover:bg-cream-200 focus:ring-navy-500"
                    )}
                    onClick={onClose}
                  >
                    <User className="w-5 h-5" aria-hidden="true" />
                    <span className="font-sans text-xs font-medium">Account</span>
                  </Link>
                  
                  {/* Cart */}
                  <button
                    onClick={() => {
                      onClose();
                      openCart();
                    }}
                    className={cn(
                      "flex flex-col items-center gap-[var(--space-1)] p-[var(--space-2)] rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 relative",
                      theme === "dark"
                        ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                        : "text-charcoal-900 hover:text-navy-900 hover:bg-cream-200 focus:ring-navy-500"
                    )}
                    aria-label={`View shopping cart with ${cartItemCount} items`}
                  >
                    <div className="relative">
                      <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                      {cartItemCount > 0 && (
                        <span className={cn(
                          "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium transition-colors duration-300",
                          theme === "dark"
                            ? "bg-accent-primary text-dark-bg-primary"
                            : "bg-navy-900 text-cream-50"
                        )}>
                          {cartItemCount > 9 ? "9+" : cartItemCount}
                        </span>
                      )}
                    </div>
                    <span className="font-sans text-xs font-medium">Cart</span>
                  </button>

                  {/* Search */}
                  <button
                    onClick={() => {
                      onClose();
                      onSearchOpen?.();
                    }}
                    className={cn(
                      "flex flex-col items-center gap-[var(--space-1)] p-[var(--space-2)] rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      theme === "dark"
                        ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                        : "text-charcoal-900 hover:text-navy-900 hover:bg-cream-200 focus:ring-navy-500"
                    )}
                    aria-label="Search products"
                  >
                    <Search className="w-5 h-5" aria-hidden="true" />
                    <span className="font-sans text-xs font-medium">Search</span>
                  </button>
                  
                  {/* Theme Toggle */}
                  <div className="flex flex-col items-center gap-[var(--space-1)]">
                    <div className={cn(
                      "glass p-[var(--space-2)] rounded-lg transition-all duration-300",
                      theme === "dark"
                        ? "bg-dark-surface/50 backdrop-blur-md border-dark-border-glass"
                        : "bg-cream-100/80 backdrop-blur-sm border-cream-200/50"
                    )}>
                      <ThemeToggle size="sm" />
                    </div>
                    <span className={cn(
                      "font-sans text-xs font-medium transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Theme
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Links - Scrollable section */}
              <nav className="flex-1 overflow-y-auto px-[var(--space-4)] sm:px-[var(--space-5)] py-[var(--space-4)] sm:py-[var(--space-5)] min-h-0">
                <ul className="space-y-[var(--space-4)] sm:space-y-[var(--space-5)]">
                  {navLinks.map((link, index) => (
                    <m.li
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.06,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      <Link
                        href={link.href}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className={cn(
                          "flex items-center font-serif text-xl sm:text-2xl font-semibold transition-colors duration-300 py-[var(--space-2)] focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg px-[var(--space-2)] -mx-[var(--space-2)] min-h-[44px]",
                          theme === "dark"
                            ? link.isEmphasized || pathname === link.href
                              ? "text-accent-primary font-semibold"
                              : "text-dark-text-primary hover:text-accent-primary"
                            : link.isEmphasized || pathname === link.href
                              ? "text-navy-900 font-semibold"
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
                  
                  {/* Customer Care Link */}
                  <m.li
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: navLinks.length * 0.06,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href="/contact"
                      className={cn(
                        "flex items-center gap-[var(--space-2)] font-serif text-lg sm:text-xl font-medium transition-colors duration-300 py-[var(--space-2)] focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg px-[var(--space-2)] -mx-[var(--space-2)] min-h-[44px]",
                        theme === "dark"
                          ? "text-dark-text-primary hover:text-accent-primary"
                          : "text-charcoal-900 hover:text-navy-900",
                        theme === "dark"
                          ? "focus:ring-accent-primary"
                          : "focus:ring-navy-500"
                      )}
                      onClick={onClose}
                    >
                      <HeadphonesIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span>Customer Care</span>
                    </Link>
                  </m.li>

                  {/* About Us Link */}
                  <m.li
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: (navLinks.length + 1) * 0.06,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href="/about"
                      className={cn(
                        "flex items-center font-serif text-lg sm:text-xl font-medium transition-colors duration-300 py-[var(--space-2)] focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg px-[var(--space-2)] -mx-[var(--space-2)] min-h-[44px]",
                        theme === "dark"
                          ? "text-dark-text-primary hover:text-accent-primary"
                          : "text-charcoal-900 hover:text-navy-900",
                        theme === "dark"
                          ? "focus:ring-accent-primary"
                          : "focus:ring-navy-500"
                      )}
                      onClick={onClose}
                    >
                      About Us
                    </Link>
                  </m.li>
                </ul>
              </nav>

              {/* Social Media Icons - Fixed at bottom */}
              <div className={cn(
                "px-[var(--space-4)] sm:px-[var(--space-5)] py-[var(--space-4)] border-t transition-colors duration-300 flex-shrink-0",
                theme === "dark"
                  ? "border-dark-border-glass"
                  : "border-cream-200"
              )}>
                <div className="flex items-center justify-center gap-[var(--space-4)]">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <m.a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                          theme === "dark"
                            ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                            : "text-charcoal-900 hover:text-navy-900 hover:bg-cream-200 focus:ring-navy-500"
                        )}
                        aria-label={social.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: (navLinks.length + 2) * 0.06 + index * 0.03,
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        onClick={onClose}
                      >
                        <Icon className="w-6 h-6" aria-hidden="true" />
                      </m.a>
                    );
                  })}
                </div>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

