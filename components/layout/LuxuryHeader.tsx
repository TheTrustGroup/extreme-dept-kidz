"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { Search, ShoppingBag, Menu, ChevronDown, User, LogIn } from "lucide-react";
import { Menu as HeadlessMenu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import MobileNav from "./MobileNav";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useCartStore } from "@/lib/stores/cart-store";

const SearchOverlay = React.lazy(() =>
  import("./SearchOverlay").then((m) => ({ default: m.SearchOverlay }))
);
const CartPreviewDropdown = React.lazy(() =>
  import("@/components/cart/CartPreviewDropdown").then((m) => ({ default: m.CartPreviewDropdown }))
);

export interface HeaderProps {
  cartCount?: number;
  user?: { name: string; email: string } | null;
  categories?: Array<{ name: string; slug: string }>;
}

const DEFAULT_CATEGORIES: Array<{ name: string; slug: string }> = [
  { name: "Boys", slug: "boys" },
  { name: "Girls", slug: "girls" },
];

/** Luxury header: Ralph Lauren–inspired, glassmorphism on scroll, mobile-first, sticky. */
export function LuxuryHeader({
  cartCount: cartCountProp,
  user = null,
  categories = DEFAULT_CATEGORIES,
}: HeaderProps): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = React.useState(false);
  const { open: openCart } = useCartDrawer();
  const storeCartCount = useCartStore((state) => state.getItemCount());
  const cartCount = cartCountProp ?? storeCartCount;
  const cartIconRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
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

  return (
    <>
      <m.header
        className={cn(
          "sticky top-0 left-0 right-0 z-[1000] border-b transition-[background-color,border-color] duration-300",
          isScrolled
            ? "backdrop-blur-md bg-white/80 dark:bg-luxury-navy-950/80 border-white/20 dark:border-white/10"
            : "bg-luxury-cream dark:bg-luxury-navy-950 border-transparent dark:border-white/5"
        )}
        initial={false}
        animate={{
          height: isScrolled ? (isMobile ? "3.25rem" : "4rem") : isMobile ? "3.5rem" : "4.5rem",
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="container-luxury h-full flex items-center justify-between gap-4">
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
                  "h-10 md:h-12 w-auto object-contain max-w-[100px] md:max-w-[120px] transition-opacity duration-200",
                  isDark && "brightness-0 invert"
                )}
              />
            </Link>
          </div>

          {/* Center: Nav — Shop, Categories (dropdown), New, Collections — desktop only */}
          <nav
            id="main-navigation"
            className="hidden md:flex items-center gap-6 lg:gap-10"
            aria-label="Main navigation"
          >
            <Link
              href="/collections/all"
              className={cn(
                "text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-200",
                pathname === "/collections/all"
                  ? isDark
                    ? "text-luxury-gold"
                    : "text-luxury-navy-900"
                  : isDark
                    ? "text-white/90 hover:text-white"
                    : "text-luxury-navy-700 hover:text-luxury-navy-900"
              )}
              aria-current={pathname === "/collections/all" ? "page" : undefined}
            >
              Shop
            </Link>

            {/* Categories dropdown */}
            <HeadlessMenu as="div" className="relative">
              <MenuButton
                className={cn(
                  "flex items-center gap-1 text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-200 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2",
                  pathname?.startsWith("/collections/boys") || pathname?.startsWith("/collections/girls")
                    ? isDark
                      ? "text-luxury-gold"
                      : "text-luxury-navy-900"
                    : isDark
                      ? "text-white/90 hover:text-white"
                      : "text-luxury-navy-700 hover:text-luxury-navy-900"
                )}
                aria-label="Categories"
              >
                Categories
                <ChevronDown className="w-4 h-4 ml-0.5 opacity-70" aria-hidden />
              </MenuButton>
              <MenuItems
                transition
                className={cn(
                  "absolute left-0 top-full mt-1 min-w-[160px] origin-top-left rounded-sm py-1 shadow-glass-lg z-50",
                  "backdrop-blur-md border border-white/20",
                  isDark ? "bg-luxury-navy-900/95" : "bg-white/95"
                )}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.slug}>
                    {({ focus }) => (
                      <Link
                        href={`/collections/${cat.slug}`}
                        className={cn(
                          "block px-4 py-2.5 text-sm uppercase tracking-wider transition-colors",
                          focus ? "bg-luxury-gold/10" : "",
                          pathname === `/collections/${cat.slug}`
                            ? isDark
                              ? "text-luxury-gold"
                              : "text-luxury-navy-900"
                            : isDark
                              ? "text-white/90"
                              : "text-luxury-navy-700"
                        )}
                      >
                        {cat.name}
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </HeadlessMenu>

            <Link
              href="/collections/new-arrivals"
              className={cn(
                "text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-200",
                pathname === "/collections/new-arrivals"
                  ? isDark
                    ? "text-luxury-gold"
                    : "text-luxury-navy-900"
                  : isDark
                    ? "text-white/90 hover:text-white"
                    : "text-luxury-navy-700 hover:text-luxury-navy-900"
              )}
              aria-current={pathname === "/collections/new-arrivals" ? "page" : undefined}
            >
              New
            </Link>

            <Link
              href="/collections"
              className={cn(
                "text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-200",
                pathname === "/collections"
                  ? isDark
                    ? "text-luxury-gold"
                    : "text-luxury-navy-900"
                  : isDark
                    ? "text-white/90 hover:text-white"
                    : "text-luxury-navy-700 hover:text-luxury-navy-900"
              )}
              aria-current={pathname === "/collections" ? "page" : undefined}
            >
              Collections
            </Link>
          </nav>

          {/* Right: Search, Cart, Account, Mobile menu */}
          <div className="flex items-center gap-0.5 md:gap-1">
            <IconButton
              aria-label="Search products"
              onClick={() => setIsSearchOpen(true)}
              title="Search (⌘K)"
              isDark={isDark}
            >
              <Search className="w-5 h-5" />
            </IconButton>

            <IconButton
              ref={cartIconRef}
              aria-label="Cart"
              onClick={() => setIsCartPreviewOpen((prev) => !prev)}
              aria-expanded={isCartPreviewOpen}
              isDark={isDark}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold",
                    isDark
                      ? "bg-luxury-gold text-luxury-navy-900"
                      : "bg-luxury-navy text-luxury-cream"
                  )}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </IconButton>

            {/* Account / Login dropdown */}
            <HeadlessMenu as="div" className="relative">
              <MenuButton
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-none transition-colors duration-200 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2",
                  isDark ? "text-white hover:bg-white/10" : "text-luxury-navy-700 hover:bg-luxury-navy/5"
                )}
                aria-label={user ? "Account menu" : "Login"}
              >
                {user ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider truncate max-w-[80px] md:max-w-[120px]">
                    <User className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">{user.name}</span>
                  </span>
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
              </MenuButton>
              <MenuItems
                transition
                className={cn(
                  "absolute right-0 top-full mt-1 min-w-[180px] origin-top-right rounded-sm py-1 shadow-glass-lg z-50",
                  "backdrop-blur-md border border-white/20",
                  isDark ? "bg-luxury-navy-900/95" : "bg-white/95"
                )}
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs text-white/70 dark:text-white/70 truncate">{user.email}</p>
                    </div>
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          href="/account"
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm uppercase tracking-wider transition-colors",
                            focus ? "bg-luxury-gold/10" : "",
                            isDark ? "text-white/90" : "text-luxury-navy-700"
                          )}
                        >
                          <User className="w-4 h-4" />
                          Account
                        </Link>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <span
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm uppercase tracking-wider transition-colors cursor-pointer",
                            focus ? "bg-luxury-gold/10" : "",
                            isDark ? "text-white/90" : "text-luxury-navy-700"
                          )}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLSpanElement).click()}
                        >
                          Sign out
                        </span>
                      )}
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem>
                    {({ focus }) => (
                      <Link
                        href="/account"
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 text-sm uppercase tracking-wider transition-colors",
                          focus ? "bg-luxury-gold/10" : "",
                          isDark ? "text-white/90" : "text-luxury-navy-700"
                        )}
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                      </Link>
                    )}
                  </MenuItem>
                )}
              </MenuItems>
            </HeadlessMenu>

            {/* Mobile: Hamburger */}
            <button
              type="button"
              className={cn(
                "md:hidden flex items-center justify-center w-11 h-11 rounded-none transition-colors duration-200",
                isDark ? "text-white hover:bg-white/10" : "text-luxury-navy-700 hover:bg-luxury-navy/5"
              )}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </m.header>

      <MobileNav
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isDark={theme === "dark"}
        onThemeToggle={toggleTheme}
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
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode; isDark?: boolean }
>(({ className, children, isDark, ...props }, ref) => (
  <button
    type="button"
    ref={ref}
    className={cn(
      "relative flex items-center justify-center w-11 h-11 rounded-none transition-colors duration-200 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2",
      isDark ? "text-white hover:bg-white/10" : "text-luxury-navy-700 hover:bg-luxury-navy/5",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
IconButton.displayName = "IconButton";
