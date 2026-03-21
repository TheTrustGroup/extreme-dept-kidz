"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { m } from "framer-motion";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * FloatingCartButton Component
 * 
 * Mobile-only floating action button that displays cart item count.
 * Fixed position at bottom-right, visible only on mobile devices.
 * Design System: Tier 3 - Mobile UX improvement
 */
export function FloatingCartButton(): JSX.Element {
  const { theme } = useTheme();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [isVisible, setIsVisible] = React.useState(false);
  const [isNearFooter, setIsNearFooter] = React.useState(false);

  // Show button only on mobile (below lg breakpoint)
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsVisible(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Hide when near footer to prevent overlap
  React.useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const viewportHeight = window.innerHeight;
        // Hide when footer is within 150px of viewport bottom
        setIsNearFooter(footerTop < viewportHeight - 150);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return <></>;

  return (
    <m.div
      className="fixed bottom-6 right-6 z-[44] lg:hidden"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: isNearFooter ? 0 : 1, scale: isNearFooter ? 0.8 : 1, y: isNearFooter ? 20 : 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href="/cart"
        className={cn(
          // Design System: Floating button - 56px × 56px, Navy 900, rounded-full
          "relative flex items-center justify-center",
          "w-14 h-14", // 56px × 56px (touch-friendly)
          theme === "dark"
            ? "bg-accent-primary text-dark-bg-primary"
            : "bg-navy-900 text-cream-50",
          "rounded-full",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-normal ease-in-out",
          theme === "dark"
            ? "hover:bg-accent-primary/90 hover:scale-105"
            : "hover:bg-navy-800 hover:scale-105",
          "active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          theme === "dark"
            ? "focus:ring-accent-primary"
            : "focus:ring-navy-500",
          "touch-manipulation"
        )}
        aria-label={`Shopping cart with ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      >
        <ShoppingBag className="w-6 h-6" aria-hidden="true" />
        
        {/* Badge - Design System: Circular badge, Forest 600, top-right */}
        {itemCount > 0 && (
          <m.span
            className={cn(
              "absolute -top-1 -right-1",
              "flex items-center justify-center",
              "min-w-[20px] h-5 px-1.5",
              theme === "dark"
                ? "bg-accent-primary text-dark-bg-primary"
                : "bg-forest-600 text-cream-50",
              "rounded-full",
              "text-xs font-bold",
              "shadow-md"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            aria-hidden="true"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </m.span>
        )}
      </Link>
    </m.div>
  );
}
