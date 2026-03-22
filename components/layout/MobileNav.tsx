"use client";

import { useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  Search,
  ShoppingBag,
  User,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  cartCount?: number;
}

const PRIMARY = [
  { label: "All", href: "/collections/all" },
  { label: "Boys", href: "/collections/boys" },
  { label: "Girls", href: "/collections/girls" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Collections", href: "/collections" },
];
const SECONDARY = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping", href: "/shipping-info" },
  { label: "Returns", href: "/returns-exchange" },
];

/** z above site header (100), topbar (101), WhatsApp (150), cart drawer (195). */
const Z_OVERLAY = 100050;
const Z_CONTENT = 100051;

/** Matches `searchProducts` / GET `/api/search` (min 2 chars). */
const MIN_SEARCH_LEN = 2;

export default function MobileNav({
  open,
  onClose,
  isDark,
  onThemeToggle,
  cartCount = 0,
}: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const pathnameCloseSkipRef = useRef(true);
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  function submitSearch(): void {
    const q = (searchRef.current?.value ?? "").trim();
    if (q.length < MIN_SEARCH_LEN) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  }

  // Close when route changes (do not depend on onClose identity).
  useEffect(() => {
    if (pathnameCloseSkipRef.current) {
      pathnameCloseSkipRef.current = false;
      return;
    }
    onCloseRef.current();
  }, [pathname]);

  return (
    <Dialog.Root
      open={open}
      modal
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            zIndex: Z_OVERLAY,
            background: "rgba(10,10,15,0.65)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            animation: open ? "mobileNavFadeIn 0.25s ease forwards" : undefined,
          }}
        />

        <Dialog.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            window.setTimeout(() => searchRef.current?.focus(), 0);
          }}
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            left: "auto",
            transform: "none",
            margin: 0,
            maxHeight: "100dvh",
            zIndex: Z_CONTENT,
            width: "min(320px, 88vw)",
            background: "var(--bg-page, #faf8f5)",
            boxShadow: "-12px 0 40px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "max(20px, env(safe-area-inset-bottom))",
            outline: "none",
            animation: open ? "mobileNavSlideIn 0.32s cubic-bezier(0.16,1,0.3,1) forwards" : undefined,
          }}
        >
          <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
          <Dialog.Description className="sr-only">
            Main site navigation, search, account, cart, and theme. Product search uses at least{" "}
            {MIN_SEARCH_LEN} characters; press Enter to open results.
          </Dialog.Description>

          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              borderBottom: "1px solid var(--border-default)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily:
                  "var(--font-montserrat, Montserrat, sans-serif)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
              }}
            >
              Menu
            </span>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  marginRight: -10,
                }}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-default)",
              flexShrink: 0,
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                padding: "0 12px",
                height: 42,
              }}
            >
              <Search
                size={15}
                style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
                aria-hidden
              />
              <input
                ref={searchRef}
                name="q"
                type="search"
                autoComplete="off"
                placeholder="Search products…"
                aria-label="Search products"
                enterKeyHint="search"
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontFamily: "var(--font-inter, Inter, sans-serif)",
                  fontSize: 14,
                  color: "var(--text-primary)",
                }}
              />
            </form>
          </div>

          <nav
            role="navigation"
            aria-label="Main navigation"
            style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}
          >
            {PRIMARY.map((item, i) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/collections/all" &&
                  pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 20px",
                    height: 52,
                    fontFamily:
                      "var(--font-montserrat, Montserrat, sans-serif)",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    color: isActive
                      ? "var(--color-navy)"
                      : "var(--text-secondary)",
                    borderBottom: "1px solid var(--border-default)",
                    background: isActive
                      ? "rgba(15,23,42,0.03)"
                      : "transparent",
                    opacity: 0,
                    animation: `navIn 0.3s ease forwards ${80 + i * 40}ms`,
                  }}
                >
                  {item.label}
                  {isActive && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--color-gold)",
                      }}
                    />
                  )}
                </Link>
              );
            })}

            <div
              style={{
                padding: "16px 20px 8px",
                fontFamily:
                  "var(--font-montserrat, Montserrat, sans-serif)",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
              }}
            >
              Support
            </div>
            {SECONDARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 20px",
                  height: 44,
                  fontFamily: "var(--font-inter, Inter, sans-serif)",
                  fontSize: 13,
                  textDecoration: "none",
                  color: "var(--text-tertiary)",
                }}
              >
                {item.label}
                <ChevronRight
                  size={13}
                  style={{ color: "var(--text-tertiary)" }}
                />
              </Link>
            ))}
          </nav>

          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              <Link
                href="/account"
                onClick={onClose}
                aria-label="Account"
                style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                <User size={18} strokeWidth={1.5} />
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                aria-label={
                  cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"
                }
                style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  position: "relative",
                }}
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "var(--color-gold)",
                      color: "var(--color-navy)",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            <button
              type="button"
              onClick={onThemeToggle}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: "1px solid var(--border-default)",
                padding: "0 14px",
                height: 36,
                cursor: "pointer",
                fontFamily:
                  "var(--font-montserrat, Montserrat, sans-serif)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                borderRadius: 0,
              }}
            >
              {isDark ? (
                <>
                  <Sun size={13} /> Light
                </>
              ) : (
                <>
                  <Moon size={13} /> Dark
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <style>{`
        @keyframes mobileNavFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mobileNavSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes navIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Dialog.Root>
  );
}
