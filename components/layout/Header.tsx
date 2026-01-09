"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { MegaMenu } from "./MegaMenu";
import { TopBar } from "./TopBar";
import { SearchOverlay } from "./SearchOverlay";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useCartStore } from "@/lib/stores/cart-store";

interface HeaderProps {
  cartItemCount?: number;
}

export function Header({ cartItemCount: _initialCartCount = 0 }: HeaderProps): JSX.Element {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const { open: openCart } = useCartDrawer();
  const cartItemCount = useCartStore((state) => state.getItemCount());

  React.useEffect((): (() => void) => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return (): void => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
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
          "fixed top-8 left-0 right-0 z-50",
          isScrolled
            ? "bg-cream-50/95 backdrop-blur-md border-b border-cream-200/50 shadow-sm"
            : "bg-cream-50/95 backdrop-blur-sm"
        )}
        initial={false}
        animate={{
          height: isScrolled
            ? isMobile
              ? "4rem"
              : "4.5rem"
            : isMobile
              ? "4.5rem"
              : "5.5rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="h-full flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <m.div
              className="flex-shrink-0 min-w-0 flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center">
                <Image
                  src="/IMG_8640.PNG"
                  alt="EXTREME DEPT KIDZ"
                  width={2800}
                  height={480}
                  className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[420px] xl:max-w-none"
                  priority
                  quality={100}
                  sizes="(max-width: 640px) 560px, (max-width: 768px) 640px, (max-width: 1024px) 720px, 840px"
                  unoptimized={false}
                />
              </Link>
            </m.div>

            {/* Desktop Navigation */}
            <nav id="main-navigation" className="hidden xl:flex items-center space-x-8 2xl:space-x-10" aria-label="Main navigation">
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

            {/* Right Side Actions */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 flex-shrink-0">
              {/* Desktop Icons */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                <IconButton 
                  aria-label="Search" 
                  onClick={() => setIsSearchOpen(true)}
                  title="Search products"
                >
                  <Search className="w-5 h-5" />
                </IconButton>
                <Link href="/account" className="relative p-2 text-charcoal-700 hover:text-charcoal-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5" aria-label="Account" />
                </Link>
                <IconButton
                  aria-label="Shopping Cart"
                  className="relative"
                  onClick={openCart}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <m.span
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-xs font-medium text-cream-50"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {cartItemCount > 9 ? "9+" : cartItemCount}
                    </m.span>
                  )}
                </IconButton>
              </div>

              {/* Mobile/Tablet Menu Button */}
              <button
                className="xl:hidden flex items-center justify-center text-charcoal-900 hover:text-navy-900 transition-colors duration-300 rounded-lg hover:bg-cream-200 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 p-2 min-h-[44px]"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex-shrink-0" />
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
      />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
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
  return (
    <Link href={href} className="relative inline-block">
      <m.span
        className={cn(
          "font-sans text-xs font-semibold uppercase tracking-wider",
          isEmphasized
            ? "text-navy-900 font-bold"
            : "text-charcoal-700 hover:text-charcoal-900",
          "transition-colors duration-300",
          "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded px-2 py-1 block"
        )}
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {children}
        <m.span
          className={cn(
            "absolute bottom-[-6px] left-0 right-0 h-[2px]",
            isEmphasized ? "bg-navy-900" : "bg-navy-900"
          )}
          initial={{ width: 0, x: "50%" }}
          whileHover={{ width: "100%", x: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
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

function IconButton({ className, children, ...props }: IconButtonProps): JSX.Element {
  return (
    <button
      className={cn(
        "relative p-2 text-charcoal-700 hover:text-charcoal-900 transition-colors duration-300",
        "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}


