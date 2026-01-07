"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useCartStore } from "@/lib/stores/cart-store";

interface HeaderProps {
  cartItemCount?: number;
}

export function Header({ cartItemCount: _initialCartCount = 0 }: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const { open: openCart } = useCartDrawer();
  const cartItemCount = useCartStore((state) => state.getItemCount());

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const navLinks = [
    { label: "Boys", href: "/collections/boys" },
    { label: "Girls", href: "/collections/girls" },
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Collections", href: "/collections" },
  ];

  return (
    <>
      <m.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          isScrolled
            ? "bg-cream-50/80 backdrop-blur-md border-b border-cream-200/50"
            : "bg-cream-50/95 backdrop-blur-sm"
        )}
        initial={false}
        animate={{
          height: isScrolled
            ? isMobile
              ? "4rem"
              : "4.5rem"
            : isMobile
              ? "5rem"
              : "6rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="h-full flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <m.div
              className="flex-shrink-0 min-w-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="block">
                <Image
                  src="/IMG_8620.PNG"
                  alt="EXTREME DEPT KIDZ"
                  width={700}
                  height={120}
                  className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[420px] xl:max-w-none"
                  priority
                  quality={100}
                />
              </Link>
            </m.div>

            {/* Desktop Navigation */}
            <nav id="main-navigation" className="hidden xl:flex items-center space-x-6 2xl:space-x-8" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink key={link.label} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 flex-shrink-0">
              {/* Desktop Icons */}
              <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                <IconButton aria-label="Search" disabled title="Search coming soon">
                  <Search className="w-5 h-5" />
                </IconButton>
                <Link href="/account" className="relative p-2 text-charcoal-700 hover:text-charcoal-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-lg">
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
                className="xl:hidden p-2 text-charcoal-900 hover:text-navy-900 transition-colors duration-300 rounded-lg hover:bg-cream-200 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
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
    </>
  );
}

// NavLink Component with hover underline effect
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link href={href} className="relative inline-block">
      <m.span
        className="font-sans text-sm font-medium text-charcoal-700 hover:text-charcoal-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded px-2 py-1 block"
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {children}
        <m.span
          className="absolute bottom-[-4px] left-2 right-2 h-[1.5px] bg-navy-900"
          initial={{ width: 0 }}
          whileHover={{ width: "calc(100% - 1rem)" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
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

function IconButton({ className, children, ...props }: IconButtonProps) {
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


