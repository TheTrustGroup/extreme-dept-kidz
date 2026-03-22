"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Search, User, Sun, Moon, ChevronDown, Menu, X } from "lucide-react";
import { dropdownIn } from "@/lib/motion";
import { useScrolled } from "@/lib/useScrolled";
import { useCartStore } from "@/lib/stores/cart-store";
import MobileNav from "./MobileNav";

// ─── Types ────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Shop", href: "/collections/all" },
  {
    label: "Collections",
    children: [
      { label: "All", href: "/collections/all" },
      { label: "Boys", href: "/collections/boys" },
      { label: "Girls", href: "/collections/girls" },
      { label: "New Arrivals", href: "/collections/new-arrivals" },
    ],
  },
  { label: "New", href: "/collections/new-arrivals" },
];

// ─── Theme toggle hook ─────────────────────────────────────────────
function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return { isDark, toggle };
}

// ─── Component ────────────────────────────────────────────────────
export default function Header() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);
  const { isDark, toggle } = useTheme();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrolled(8);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Lock body scroll when mobile nav open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href?: string) =>
    href ? pathname === href || pathname.startsWith(href + "/") : false;

  return (
    <>
      {/* ── Main header ─────────────────────────────────────────── */}
      <header
        className={[
          "header-site fixed left-0 right-0 z-[100]",
          "transition-all duration-250",
          scrolled
            ? "bg-[var(--bg-page)]/95 backdrop-blur-md border-b border-[var(--border-default)]"
            : "bg-[var(--bg-page)]",
        ].join(" ")}
        style={{
          top: "var(--topbar-height, 0px)",
          transition: "top 0.3s ease, background-color 0.25s ease",
          isolation: "isolate",
        }}
      >
        <div className="container-luxury h-full flex items-center justify-between gap-6">
          {/* ── Logo ───────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center"
            aria-label="Extreme Dept Kidz home"
          >
            <Image
              src="/IMG_8640.PNG"
              alt="Extreme Dept Kidz"
              width={120}
              height={28}
              priority
              className="h-7 w-auto object-contain lg:h-9 dark:brightness-0 dark:invert"
            />
          </Link>

          {/* ── Desktop nav ────────────────────────────────────── */}
          <nav
            className="hidden lg:flex items-center gap-1"
            ref={dropdownRef}
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <button
                    className={[
                      "header-nav-link flex items-center gap-1",
                      openDropdown === item.label ? "text-[var(--color-navy)]" : "",
                    ].join(" ")}
                    onClick={() =>
                      setOpenDropdown(openDropdown === item.label ? null : item.label)
                    }
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <motion.span
                      animate={{ rotate: openDropdown === item.label ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center"
                    >
                      <ChevronDown size={13} strokeWidth={2} />
                    </motion.span>
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    className={[
                      "header-nav-link",
                      isActive(item.href) ? "header-nav-link--active" : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                )}

                <AnimatePresence>
                  {item.children && openDropdown === item.label && (
                    <motion.div
                      variants={dropdownIn}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 origin-top"
                      style={{ zIndex: 200 }}
                    >
                      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-card shadow-dropdown overflow-hidden py-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={[
                              "block px-4 py-3 text-label-lg",
                              "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                              "hover:bg-[var(--bg-surface-2)]",
                              "transition-colors duration-150",
                              isActive(child.href)
                                ? "text-[var(--color-navy)] font-semibold"
                                : "",
                            ].join(" ")}
                            onClick={() => setOpenDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* ── Right actions ───────────────────────────────────── */}
          <div className="flex items-center gap-1">
            {/* Search — expands inline on desktop */}
            <div className="hidden lg:flex items-center relative">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                      width: 220,
                      opacity: 1,
                      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                    }}
                    exit={{ width: 0, opacity: 0, transition: { duration: 0.2 } }}
                    className="overflow-hidden mr-2"
                  >
                    <input
                      ref={searchRef}
                      type="search"
                      placeholder="Search products…"
                      className="w-full h-9 px-3 text-body-sm bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-input outline-none focus:border-[var(--color-gold)] transition-colors"
                      onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                className="icon-btn"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label={searchOpen ? "Close search" : "Open search"}
              >
                {searchOpen ? (
                  <X size={18} strokeWidth={1.5} />
                ) : (
                  <Search size={18} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Account */}
            <Link
              href="/account"
              className="icon-btn hidden lg:flex"
              aria-label="Account"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            {/* Theme toggle */}
            <button
              className="icon-btn hidden lg:flex"
              onClick={toggle}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <Sun size={18} strokeWidth={1.5} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <Moon size={18} strokeWidth={1.5} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="icon-btn relative"
              aria-label={
                cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"
              }
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-pill bg-[var(--color-gold)] text-[var(--color-navy)] text-[10px] font-bold flex items-center justify-center leading-none"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile menu — no Framer Motion wrappers (avoids transform conflicts with drawer) */}
            <button
              type="button"
              className="icon-btn lg:hidden ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={20} strokeWidth={1.5} />
              ) : (
                <Menu size={20} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Spacer — total height = topbar + header ───────────────── */}
      <div className="header-spacer" aria-hidden="true" />

      {/* ── Mobile nav ──────────────────────────────────────────── */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isDark={isDark}
        onThemeToggle={toggle}
        cartCount={cartCount}
      />
    </>
  );
}
