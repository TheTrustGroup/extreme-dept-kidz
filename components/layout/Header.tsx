"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { Search, ShoppingBag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { MobileNav } from "./MobileNav";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useCartStore } from "@/lib/stores/cart-store";

const SearchOverlay = React.lazy(() => import("./SearchOverlay").then((m) => ({ default: m.SearchOverlay })));
const CartPreviewDropdown = React.lazy(() =>
  import("@/components/cart/CartPreviewDropdown").then((m) => ({ default: m.CartPreviewDropdown }))
);

interface HeaderProps {
  cartItemCount?: number;
}

/** PHASE 4 — Single row: [ Logo ] [ Shop | New | Collections ] [ Search ] [ Cart ]. No duplicates. */
export function Header({ cartItemCount: _initialCartCount = 0 }: HeaderProps): JSX.Element {
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(typeof window !== "undefined" && window.innerWidth < 768);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = React.useState(false);
  const { open: openCart } = useCartDrawer();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const cartIconRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        setIsMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const pathname = usePathname();
  const isDark = theme === "dark";
  const navLinks = [
    { label: "Shop", href: "/collections/all" },
    { label: "New", href: "/collections/new-arrivals" },
    { label: "Collections", href: "/collections" },
  ];

  return (
    <>
      <m.header
        className={cn(
          "header glass sticky top-0 left-0 right-0 z-[1000] border-b"
        )}
        initial={false}
        animate={{
          height: isScrolled ? (isMobile ? "3.25rem" : "4rem") : isMobile ? "3.5rem" : "4.5rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center" aria-label="Extreme Dept Kidz Home">
              <OptimizedImage
                src="/IMG_8640.PNG"
                alt="EXTREME DEPT KIDZ"
                width={1080}
                height={720}
                variant="custom"
                customSizes="(max-width: 768px) 100px, 120px"
                isLCP={false}
                useIntersectionObserver={false}
                enablePrefetch={false}
                quality={75}
                className={cn(
                  "h-10 md:h-12 w-auto object-contain max-w-[100px] md:max-w-[120px]",
                  isDark && "brightness-0 invert"
                )}
              />
            </Link>
          </div>

          {/* Center: Nav — Shop | New | Collections (desktop only) */}
          <nav
            id="main-navigation"
            className="hidden md:flex items-center gap-6 lg:gap-8"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-[var(--text-sm)] font-medium uppercase tracking-wide transition-colors",
                  pathname === link.href
                    ? isDark
                      ? "text-accent-primary"
                      : "text-navy-900"
                    : isDark
                      ? "text-white/90 hover:text-white"
                      : "text-charcoal-700 hover:text-charcoal-900"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Search + Cart (single row) */}
          <div className="flex items-center gap-1 md:gap-2">
            <IconButton
              aria-label="Search products"
              onClick={() => setIsSearchOpen(true)}
              title="Search (⌘K)"
            >
              <Search className="w-5 h-5" />
            </IconButton>
            <IconButton
              ref={cartIconRef}
              aria-label="Cart"
              onClick={() => setIsCartPreviewOpen(!isCartPreviewOpen)}
              aria-expanded={isCartPreviewOpen}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold",
                    isDark ? "bg-accent-primary text-dark-bg-primary" : "bg-navy-900 text-cream-50"
                  )}
                >
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </IconButton>

            {/* Mobile: Menu */}
            <button
              type="button"
              className={cn(
                "md:hidden flex items-center justify-center w-11 h-11 rounded-lg transition-colors",
                isDark ? "text-white hover:bg-white/10" : "text-charcoal-900 hover:bg-cream-200/60"
              )}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </m.header>

      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        cartItemCount={cartItemCount}
        onSearchOpen={() => {
          setIsMobileMenuOpen(false);
          setIsSearchOpen(true);
        }}
      />

      {isSearchOpen && (
        <React.Suspense fallback={null}>
          <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </React.Suspense>
      )}

      {isCartPreviewOpen && (
        <React.Suspense fallback={null}>
          <CartPreviewDropdown
            isOpen={isCartPreviewOpen}
            onClose={() => setIsCartPreviewOpen(false)}
            triggerRef={cartIconRef}
          />
        </React.Suspense>
      )}
    </>
  );
}

const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "relative flex items-center justify-center w-11 h-11 rounded-lg transition-colors",
        isDark ? "text-white hover:bg-white/10" : "text-charcoal-700 hover:bg-cream-200/60 hover:text-charcoal-900",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
IconButton.displayName = "IconButton";
