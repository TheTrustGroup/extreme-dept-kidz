"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { MobileNav } from "./MobileNav";
import { MegaMenu } from "./MegaMenu";
import { TopBar } from "./TopBar";
import { SearchOverlay } from "./SearchOverlay";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useCartStore } from "@/lib/stores/cart-store";
import { CartPreviewDropdown } from "@/components/cart/CartPreviewDropdown";
import { AccountDropdown } from "@/components/auth/AccountDropdown";
import { SignInModal } from "@/components/auth/SignInModal";
import { CreateAccountModal } from "@/components/auth/CreateAccountModal";

interface HeaderProps {
  cartItemCount?: number;
}

export function Header({ cartItemCount: _initialCartCount = 0 }: HeaderProps): JSX.Element {
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = React.useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = React.useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = React.useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = React.useState(false);
  const { open: openCart } = useCartDrawer();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const cartIconRef = React.useRef<HTMLButtonElement>(null);
  const accountIconRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect((): (() => void) => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    // Keyboard shortcut: Cmd/Ctrl + K to open search
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    handleResize();
    // CRITICAL: Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return (): void => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navLinks = [
    { label: "BOYS", href: "/collections/boys", hasMegaMenu: true },
    { label: "NEW ARRIVALS", href: "/collections/new-arrivals" },
    { label: "GIRLS", href: "/collections/girls" },
    { label: "COLLECTIONS", href: "/collections" },
  ];

  return (
    <>
      <TopBar />
      <m.header
        className={cn(
          "header",
          "fixed left-0 right-0 z-[1000]",
          "top-0 md:top-8", // Mobile: top-0, Desktop: offset by TopBar height (32px)
          theme === "dark"
            ? "bg-dark-surface backdrop-blur-xl border-b border-dark-border-glass"
            : "bg-cream-50/88 backdrop-blur-xl border-b border-cream-200/50"
        )}
        initial={false}
        animate={{
          height: isScrolled
            ? isMobile
              ? "3.25rem"
              : "4rem"
            : isMobile
              ? "3.5rem"
              : "4.5rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full max-w-7xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden md:flex h-full items-center">
            {/* Logo - Left Aligned with Consistent Padding (8px base scale) */}
            <m.div
              className={cn(
                "flex-shrink-0 flex items-center h-full",
                "pl-[var(--space-5)] lg:pl-[var(--space-7)]",
                isScrolled && "opacity-95"
              )}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center h-full">
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
                    "h-12 md:h-14 w-auto object-contain max-w-[100px] md:max-w-[120px]",
                    "transition-opacity duration-300",
                    theme === "dark" 
                      ? "brightness-0 invert" // Invert logo colors for dark mode visibility
                      : ""
                  )}
                />
              </Link>
            </m.div>

            {/* Search Button - Between Logo and Navigation (Desktop) */}
            <div className="hidden lg:flex items-center ml-[var(--space-6)] mr-[var(--space-4)]">
              <IconButton 
                aria-label="Search products" 
                onClick={() => setIsSearchOpen(true)}
                title="Search products (⌘K)"
                className="relative"
              >
                <Search className="w-5 h-5" />
              </IconButton>
            </div>

            {/* Desktop Navigation - Centered between Logo and Actions (8px base scale) */}
            <nav id="main-navigation" className="hidden lg:flex items-center justify-center flex-1 gap-[var(--space-8)] 2xl:gap-[var(--space-10)]" aria-label="Main navigation">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.hasMegaMenu && setIsMegaMenuOpen(true)}
                  onMouseLeave={() => link.hasMegaMenu && setIsMegaMenuOpen(false)}
                >
                  <NavLink href={link.href} isEmphasized={link.label === "BOYS"}>
                    {link.label}
                  </NavLink>
                  {link.hasMegaMenu && (
                    <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Actions - Right Aligned with Consistent Padding (8px base scale) */}
            <div className="flex items-center justify-center flex-shrink-0 ml-auto gap-[var(--space-4)] lg:gap-[var(--space-5)] pr-[var(--space-5)] lg:pr-[var(--space-6)]">
              {/* Desktop Icons */}
              <div className="flex items-center gap-[var(--space-3)] lg:gap-[var(--space-4)]">
                <ThemeToggle size="sm" />
                {/* Search Button - Tablet (hidden on desktop and mobile) */}
                <div className="md:hidden lg:hidden">
                  <IconButton 
                    aria-label="Search products" 
                    onClick={() => setIsSearchOpen(true)}
                    title="Search products (⌘K)"
                  >
                    <Search className="w-5 h-5" />
                  </IconButton>
                </div>
                <div className="relative">
                  <IconButton
                    ref={accountIconRef}
                    aria-label="Account"
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    className="relative"
                    aria-expanded={isAccountDropdownOpen}
                  >
                    <User className="w-5 h-5" />
                  </IconButton>
                  <AccountDropdown
                    isOpen={isAccountDropdownOpen}
                    onClose={() => setIsAccountDropdownOpen(false)}
                    triggerRef={accountIconRef}
                  />
                </div>
                <IconButton
                  ref={cartIconRef}
                  aria-label="Shopping Cart"
                  className="relative"
                  onClick={() => setIsCartPreviewOpen(!isCartPreviewOpen)}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <m.span
                      className={cn(
                        "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
                        theme === "dark"
                          ? "bg-accent-primary text-dark-bg-primary"
                          : "bg-navy-900 text-cream-50"
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </m.span>
                  )}
                </IconButton>
              </div>
            </div>
          </div>

          {/* Mobile Layout (< 768px) */}
          <div className="md:hidden h-full flex items-center justify-between px-[var(--space-4)]">
            {/* Logo - Left Aligned */}
            <m.div
              className={cn(
                "flex-shrink-0 flex items-center h-full",
                isScrolled && "opacity-95"
              )}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center h-full">
                <OptimizedImage
                  src="/IMG_8640.PNG"
                  alt="EXTREME DEPT KIDZ"
                  width={1080}
                  height={720}
                  variant="custom"
                  customSizes="120px"
                  isLCP={false}
                  useIntersectionObserver={false}
                  enablePrefetch={false}
                  quality={75}
                  className={cn(
                    "h-10 w-auto object-contain max-w-[120px]",
                    "transition-opacity duration-300",
                    theme === "dark" 
                      ? "brightness-0 invert" // Invert logo colors for dark mode visibility
                      : ""
                  )}
                />
              </Link>
            </m.div>

            {/* Right Side Actions: Search | Cart | Menu */}
            <div className="flex items-center gap-[var(--space-2)]">
              {/* Search Icon */}
              <IconButton 
                aria-label="Search products" 
                onClick={() => setIsSearchOpen(true)}
                title="Search products (⌘K)"
                className="relative"
              >
                <Search className="w-5 h-5" />
              </IconButton>

              {/* Cart Icon */}
              <IconButton
                ref={cartIconRef}
                aria-label="Shopping Cart"
                className="relative"
                onClick={() => setIsCartPreviewOpen(!isCartPreviewOpen)}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <m.span
                    className={cn(
                      "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
                      theme === "dark"
                        ? "bg-accent-primary text-dark-bg-primary"
                        : "bg-navy-900 text-cream-50"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </m.span>
                )}
              </IconButton>

              {/* Menu Hamburger */}
              <button
                className={cn(
                  "flex items-center justify-center transition-colors duration-300 rounded-lg hover:bg-cream-200 focus:outline-none focus:ring-2 focus:ring-offset-2 p-3 min-h-[44px] min-w-[44px] relative z-[1003]",
                  theme === "dark"
                    ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface focus:ring-accent-primary"
                    : "text-charcoal-900 hover:text-navy-900 focus:ring-navy-500"
                )}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </m.header>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        cartItemCount={cartItemCount}
        onSearchOpen={() => setIsSearchOpen(true)}
      />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Cart Preview Dropdown */}
      <CartPreviewDropdown
        isOpen={isCartPreviewOpen}
        onClose={() => setIsCartPreviewOpen(false)}
        triggerRef={cartIconRef}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSwitchToSignUp={() => {
          setIsSignInModalOpen(false);
          setIsSignUpModalOpen(true);
        }}
      />

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSwitchToSignIn={() => {
          setIsSignUpModalOpen(false);
          setIsSignInModalOpen(true);
        }}
      />
    </>
  );
}

// NavLink Component with premium hover underline effect
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isEmphasized?: boolean;
}

function NavLink({ href, children, isEmphasized = false }: NavLinkProps): JSX.Element {
  const { theme } = useTheme();
  return (
    <Link href={href} className="relative inline-block group/nav">
      <m.span
        className={cn(
          "font-sans text-xs font-medium uppercase tracking-wider",
          "px-[var(--space-3)] py-[var(--space-2)] rounded-lg block",
          "transition-all duration-[var(--duration-nav-hover)] ease-[var(--ease-premium)]",
          "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-lg",
          theme === "dark"
            ? isEmphasized
              ? "text-accent-primary font-semibold"
              : "text-dark-text-primary group-hover/nav:text-accent-primary group-hover/nav:bg-dark-surface"
            : isEmphasized
              ? "text-navy-900 font-semibold"
              : "text-charcoal-700 group-hover/nav:text-charcoal-900 group-hover/nav:bg-cream-200/50"
        )}
        whileHover={{ 
          y: -1,
          transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1, ease: [0.4, 0, 1, 1] }
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
        <span
          className={cn(
            "absolute bottom-[var(--space-2)] left-[var(--space-2)] right-[var(--space-2)] h-[2px] rounded-full transition-all duration-[var(--duration-nav-hover)] ease-[var(--ease-premium)] origin-center",
            theme === "dark"
              ? isEmphasized
                ? "bg-accent-primary scale-x-100"
                : "bg-accent-primary scale-x-0 group-hover/nav:scale-x-100"
              : isEmphasized
                ? "bg-navy-900 scale-x-100"
                : "bg-navy-900 scale-x-0 group-hover/nav:scale-x-100"
          )}
          aria-hidden="true"
        />
      </m.span>
    </Link>
  );
}

// Icon Button Component
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, ...props }, ref) => {
  const { theme } = useTheme();
  return (
    <button
      type="button"
      className={cn(
        "relative min-h-[44px] min-w-[44px] rounded-lg",
        "p-[var(--space-2)]",
        "hover:scale-105 active:scale-95",
        "transition-all duration-300 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-lg",
        theme === "dark"
          ? "text-dark-text-primary hover:text-accent-primary hover:bg-dark-surface"
          : "text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200/60",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

IconButton.displayName = "IconButton";

