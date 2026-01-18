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
          "fixed left-0 right-0 z-50",
          isScrolled
            ? "bg-cream-50/95 backdrop-blur-lg border-b border-cream-200/30 shadow-sm"
            : "bg-cream-50/95 backdrop-blur-md"
        )}
        style={{
          top: "2rem",
        }}
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
          <div className="h-full flex items-center">
            {/* Logo - Left Aligned with Consistent Padding */}
            <m.div
              className={cn(
                "flex-shrink-0 flex items-center h-full pl-4 sm:pl-4 md:pl-5 lg:pl-7",
                isScrolled && "opacity-95"
              )}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center h-full">
                <Image
                  src="/IMG_8640.PNG"
                  alt="EXTREME DEPT KIDZ"
                  width={1080}
                  height={720}
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain max-w-[80px] sm:max-w-[100px] md:max-w-[120px]"
                  priority
                  quality={100}
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 120px"
                  unoptimized={false}
                />
              </Link>
            </m.div>

            {/* Desktop Navigation - Centered between Logo and Actions */}
            <nav id="main-navigation" className="hidden lg:flex items-center justify-center flex-1 space-x-7 2xl:space-x-8" aria-label="Main navigation">
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

            {/* Right Side Actions - Right Aligned with Consistent Padding */}
            <div className="flex items-center justify-center space-x-3 sm:space-x-3 md:space-x-4 lg:space-x-5 flex-shrink-0 ml-auto pr-4 sm:pr-4 md:pr-5 lg:pr-6">
              {/* Desktop Icons */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                <IconButton 
                  aria-label="Search" 
                  onClick={() => setIsSearchOpen(true)}
                  title="Search products"
                >
                  <Search className="w-5 h-5" />
                </IconButton>
                <Link href="/account" className="relative p-2.5 min-h-[44px] min-w-[44px] text-charcoal-700 hover:text-charcoal-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-lg flex items-center justify-center">
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
                className="xl:hidden flex items-center justify-center text-charcoal-900 hover:text-navy-900 transition-colors duration-300 rounded-lg hover:bg-cream-200 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 p-3 min-h-[44px] min-w-[44px]"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
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
        whileHover={{ y: -0.5 }}
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
        "relative p-2.5 min-h-[44px] min-w-[44px] text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-100/50 transition-colors duration-300",
        "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}


