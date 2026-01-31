"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <div
      className={cn(
        "fixed inset-0 z-50",
        isOpen ? "block" : "hidden"
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop — closes menu on click */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel — fixed overlay, slides from right */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 right-0 h-screen w-80 max-w-[85vw] shadow-2xl",
          "transform transition-transform duration-300 ease-out focus:outline-none",
          theme === "dark" ? "glass border-l border-dark-border-glass" : "bg-white",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
            theme === "dark"
              ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
              : "text-charcoal-900 hover:text-navy-900 hover:bg-cream-200 focus:ring-navy-500"
          )}
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Menu content with scroll */}
        <div className="h-full overflow-y-auto pt-16 pb-6 px-6">
          {/* Quick Actions — Account, Cart, Search, Theme */}
          <div className={cn(
            "py-4 border-b transition-colors duration-300",
            theme === "dark" ? "border-dark-border-glass" : "border-cream-200"
          )}>
            <div className="grid grid-cols-4 gap-2">
              <Link
                href="/account"
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  theme === "dark"
                    ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                    : "text-charcoal-900 hover:text-navy-900 hover:bg-cream-200 focus:ring-navy-500"
                )}
                onClick={onClose}
              >
                <User className="w-5 h-5" aria-hidden="true" />
                <span className="font-sans text-xs font-medium">Account</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openCart();
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 relative",
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
                      "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium",
                      theme === "dark" ? "bg-accent-primary text-dark-bg-primary" : "bg-navy-900 text-cream-50"
                    )}>
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </span>
                  )}
                </div>
                <span className="font-sans text-xs font-medium">Cart</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSearchOpen?.();
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  theme === "dark"
                    ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                    : "text-charcoal-900 hover:text-navy-900 hover:bg-cream-200 focus:ring-navy-500"
                )}
                aria-label="Search products"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
                <span className="font-sans text-xs font-medium">Search</span>
              </button>
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "glass p-2 rounded-lg transition-all duration-300",
                  theme === "dark"
                    ? "bg-dark-surface/50 backdrop-blur-md border-dark-border-glass"
                    : "bg-cream-100/80 backdrop-blur-sm border-cream-200/50"
                )}>
                  <ThemeToggle size="sm" />
                </div>
                <span className={cn(
                  "font-sans text-xs font-medium",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  Theme
                </span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className={cn(
            "py-3 border-b transition-colors duration-300",
            theme === "dark" ? "border-dark-border-glass" : "border-cream-200"
          )}>
            <div className="flex items-center justify-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      theme === "dark"
                        ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                        : "text-charcoal-900 hover:text-navy-900 hover:bg-cream-200 focus:ring-navy-500"
                    )}
                    aria-label={social.label}
                    onClick={onClose}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="pt-4" aria-label="Navigation menu">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(
                      "flex items-center font-serif text-xl font-semibold transition-colors duration-300 py-2 rounded-lg px-2 -mx-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2",
                      theme === "dark"
                        ? link.isEmphasized || pathname === link.href
                          ? "text-accent-primary"
                          : "text-dark-text-primary hover:text-accent-primary"
                        : link.isEmphasized || pathname === link.href
                          ? "text-navy-900"
                          : "text-charcoal-900 hover:text-navy-900",
                      theme === "dark" ? "focus:ring-accent-primary" : "focus:ring-navy-500"
                    )}
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className={cn(
                    "flex items-center gap-2 font-serif text-lg font-medium transition-colors duration-300 py-2 rounded-lg px-2 -mx-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2",
                    theme === "dark"
                      ? "text-dark-text-primary hover:text-accent-primary focus:ring-accent-primary"
                      : "text-charcoal-900 hover:text-navy-900 focus:ring-navy-500"
                  )}
                  onClick={onClose}
                >
                  <HeadphonesIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span>Customer Care</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={cn(
                    "flex items-center font-serif text-lg font-medium transition-colors duration-300 py-2 rounded-lg px-2 -mx-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2",
                    theme === "dark"
                      ? "text-dark-text-primary hover:text-accent-primary focus:ring-accent-primary"
                      : "text-charcoal-900 hover:text-navy-900 focus:ring-navy-500"
                  )}
                  onClick={onClose}
                >
                  About Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

