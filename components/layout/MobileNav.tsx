"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  User,
  Sun,
  Moon,
  ChevronRight,
  X,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────
interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  cartCount?: number;
}

const PRIMARY_LINKS = [
  { label: "All", href: "/collections/all" },
  { label: "Boys", href: "/collections/boys" },
  { label: "Girls", href: "/collections/girls" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Collections", href: "/collections" },
];

const SECONDARY_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping", href: "/shipping-info" },
  { label: "Returns", href: "/returns-exchange" },
];

const DRAWER_EASE_OPEN: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DRAWER_EASE_CLOSE: [number, number, number, number] = [0.7, 0, 1, 1];
const LINK_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const primaryListVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
};

const linkItemVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.28,
      ease: LINK_EASE,
    },
  },
};

const secondaryListVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08 + 5 * 0.04 + 0.08,
    },
  },
};

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/collections") {
    return false;
  }
  return pathname.startsWith(href + "/");
}

// ─── Component ────────────────────────────────────────────────────
export default function MobileNav({
  open,
  onClose,
  isDark,
  onThemeToggle,
  cartCount = 0,
}: MobileNavProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathnameCloseSkipRef = useRef(true);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (pathnameCloseSkipRef.current) {
      pathnameCloseSkipRef.current = false;
      return;
    }
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-nav-backdrop"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-[190] bg-[rgba(15,23,42,0.5)] backdrop-blur-[4px] lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: "100%", opacity: 0 }}
            animate={{
              x: 0,
              opacity: 1,
              transition: { duration: 0.32, ease: DRAWER_EASE_OPEN },
            }}
            exit={{
              x: "100%",
              opacity: 0,
              transition: { duration: 0.26, ease: DRAWER_EASE_CLOSE },
            }}
            style={{
              boxShadow: "-8px 0 32px rgba(15,23,42,0.12)",
            }}
            className={[
              "fixed right-0 top-0 bottom-0 z-[200] flex flex-col lg:hidden",
              "w-[min(320px,88vw)] bg-[var(--bg-page)]",
              "pb-[env(safe-area-inset-bottom,0px)]",
            ].join(" ")}
          >
            {/* 1. Header row */}
            <div
              className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--border-default)] px-5"
              style={{ height: 56 }}
            >
              <span
                className="font-montserrat font-semibold uppercase text-[var(--text-tertiary)]"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.16em",
                }}
              >
                MENU
              </span>
              <button
                type="button"
                className="icon-btn h-11 w-11 shrink-0"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* 2. Search */}
            <div className="flex-shrink-0 border-b border-[var(--border-default)] px-5 py-4">
              <div className="relative">
                <Search
                  size={15}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                  aria-hidden
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={[
                    "h-11 w-full rounded-none border border-[var(--border-default)] bg-[var(--bg-surface-2)] pl-9 pr-4",
                    "font-inter text-[14px] text-[var(--text-primary)] outline-none transition-colors",
                    "placeholder:text-[var(--text-tertiary)]",
                    "focus:border-[var(--color-gold)]",
                  ].join(" ")}
                  style={{ height: 44 }}
                />
              </div>
            </div>

            {/* 3. Navigation */}
            <div
              role="navigation"
              aria-label="Main"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2"
            >
              <motion.ul
                className="list-none p-0 m-0"
                variants={primaryListVariants}
                initial="hidden"
                animate="show"
              >
                {PRIMARY_LINKS.map((link) => {
                  const active = isNavActive(pathname, link.href);
                  return (
                    <motion.li key={link.href} variants={linkItemVariants}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={[
                          "relative flex h-[52px] min-h-[52px] items-center border-b border-[var(--border-default)] px-5",
                          "font-montserrat font-semibold uppercase",
                          active
                            ? "text-[var(--text-primary)]"
                            : "text-[var(--text-secondary)]",
                        ].join(" ")}
                        style={{ fontSize: 12, letterSpacing: "0.1em" }}
                      >
                        {link.label}
                        {active && (
                          <span
                            className="absolute right-5 top-1/2 size-[6px] -translate-y-1/2 rounded-full bg-[var(--color-gold)]"
                            aria-hidden
                          />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <div className="pt-5">
                <p
                  className="mb-2 px-5 font-montserrat font-medium text-[var(--text-tertiary)]"
                  style={{ fontSize: 10, letterSpacing: "0.12em" }}
                >
                  Support
                </p>
                <motion.ul
                  className="list-none p-0 m-0"
                  variants={secondaryListVariants}
                  initial="hidden"
                  animate="show"
                >
                  {SECONDARY_LINKS.map((link) => (
                    <motion.li key={link.href} variants={linkItemVariants}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="flex h-11 min-h-[44px] items-center justify-between px-5 font-inter text-[13px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
                      >
                        {link.label}
                        <ChevronRight
                          size={13}
                          strokeWidth={1.5}
                          className="shrink-0 text-[var(--text-tertiary)]"
                          aria-hidden
                        />
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </div>

            {/* 4. Bottom row */}
            <div
              className="flex flex-shrink-0 items-center justify-between border-t border-[var(--border-default)] px-5 py-4"
              style={{
                paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))",
              }}
            >
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="icon-btn"
                  aria-label="Account"
                >
                  <User size={18} strokeWidth={1.5} />
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="icon-btn relative"
                  aria-label={
                    cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"
                  }
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-gold)] px-1 text-[10px] font-semibold leading-none text-[var(--color-navy)]">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                onClick={onThemeToggle}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun size={16} strokeWidth={1.5} />
                ) : (
                  <Moon size={16} strokeWidth={1.5} />
                )}
                <span
                  className="font-montserrat font-semibold text-[var(--text-secondary)]"
                  style={{ fontSize: 10, letterSpacing: "0.1em" }}
                >
                  {isDark ? "Light" : "Dark"}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
