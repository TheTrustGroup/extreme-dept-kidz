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
import { slideInRight, fadeIn } from "@/lib/motion";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────
interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

const PRIMARY_LINKS = [
  { label: "All", href: "/collections/all" },
  { label: "Boys", href: "/collections/boys" },
  { label: "Girls", href: "/collections/girls" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Collections", href: "/collections" },
];

const SECONDARY_LINKS = [
  { label: "Customer Care", href: "/contact" },
  { label: "About Us", href: "/about" },
  { label: "Shipping", href: "/shipping-info" },
  { label: "Returns", href: "/returns-exchange" },
];

// ─── Component ────────────────────────────────────────────────────
export default function MobileNav({
  open,
  onClose,
  isDark,
  onThemeToggle,
}: MobileNavProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[190] bg-[var(--color-navy)]/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.nav
            key="drawer"
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 z-drawer w-[min(320px,90vw)] bg-[var(--bg-page)] lg:hidden flex flex-col"
            aria-label="Mobile navigation"
          >
            {/* ── Header row ──────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--border-default)] flex-shrink-0">
              <span className="text-label text-[var(--text-tertiary)]">Menu</span>
              <button
                className="icon-btn"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* ── Search ──────────────────────────────────────────── */}
            <div className="px-6 py-4 flex-shrink-0">
              <div className="relative">
                <Search
                  size={15}
                  strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                />
                <input
                  type="search"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 text-body-sm bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-input outline-none focus:border-[var(--color-gold)] transition-colors"
                />
              </div>
            </div>

            {/* ── Primary nav links ────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-1 mb-8">
                {PRIMARY_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: 0.05 + i * 0.04,
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={[
                        "flex items-center justify-between",
                        "py-3.5 border-b border-[var(--border-default)]",
                        "transition-colors duration-150",
                        isActive(link.href)
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "text-h3",
                          isActive(link.href)
                            ? "text-[var(--color-navy)] dark:text-[var(--color-cream)]"
                            : "",
                        ].join(" ")}
                        style={{ fontSize: "13px", letterSpacing: "0.1em" }}
                      >
                        {link.label}
                      </span>
                      {isActive(link.href) && (
                        <span className="w-1.5 h-1.5 rounded-pill bg-[var(--color-gold)]" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Secondary links */}
              <div className="space-y-1">
                <p className="text-label text-[var(--text-tertiary)] mb-3">
                  Support
                </p>
                {SECONDARY_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: 0.2 + i * 0.03,
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between py-2.5 text-body-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {link.label}
                      <ChevronRight
                        size={13}
                        strokeWidth={1.5}
                        className="text-[var(--text-tertiary)]"
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Bottom actions ───────────────────────────────────── */}
            <div className="flex-shrink-0 border-t border-[var(--border-default)] px-6 py-4 flex items-center justify-between pb-[max(16px,env(safe-area-inset-bottom))]">
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
                  className="icon-btn"
                  aria-label="Cart"
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                </Link>
              </div>
              <button
                className="flex items-center gap-2 text-body-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={onThemeToggle}
                aria-label={
                  isDark ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDark ? (
                  <Sun size={16} strokeWidth={1.5} />
                ) : (
                  <Moon size={16} strokeWidth={1.5} />
                )}
                <span className="text-label">{isDark ? "Light" : "Dark"}</span>
              </button>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
