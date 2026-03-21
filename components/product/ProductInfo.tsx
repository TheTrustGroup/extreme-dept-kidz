"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronDown,
  Ruler,
  RotateCcw,
  Truck,
  Share2,
  Check,
} from "lucide-react";
import { useToast } from "@/lib/stores/toast-store";

// ─── Types ────────────────────────────────────────────────────────
interface Variant {
  id: string;
  size: string;
  stock: number;
}

interface ProductInfoProps {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  description?: string;
  variants: Variant[];
  collectionName?: string;
  collectionSlug?: string;
  badge?: "new" | "sale" | null;
  onAddToCart: (productId: string, variantId: string) => Promise<void>;
  /** When provided, parent can sync current selection for StickyAddToCart */
  onVariantChange?: (variantId: string | null) => void;
}

// ─── Price formatter ──────────────────────────────────────────────
function fmt(n: number, cur = "GHS ₵") {
  return `${cur}${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Accordion item ───────────────────────────────────────────────
function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="pdp-accordion">
      <button
        className="pdp-accordion__trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5 text-[var(--text-primary)]">
          <span className="text-[var(--text-tertiary)]">{icon}</span>
          <span
            className="text-label-lg"
            style={{ fontSize: "12px", letterSpacing: "0.1em" }}
          >
            {title}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[var(--text-tertiary)] flex items-center"
        >
          <ChevronDown size={15} strokeWidth={1.5} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="pdp-accordion__content">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Share button ─────────────────────────────────────────────────
function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: name, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      style={{ fontSize: "12px" }}
      aria-label="Share product"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-[var(--color-gold)]"
          >
            <Check size={13} strokeWidth={2} />
            <span
              className="text-label"
              style={{ fontSize: "11px", letterSpacing: "0.1em" }}
            >
              Copied
            </span>
          </motion.span>
        ) : (
          <motion.span
            key="share"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <Share2 size={13} strokeWidth={1.5} />
            <span
              className="text-label"
              style={{ fontSize: "11px", letterSpacing: "0.1em" }}
            >
              Share
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────
export default function ProductInfo({
  id,
  name,
  price,
  compareAtPrice,
  currency = "GHS ₵",
  description,
  variants,
  collectionName,
  collectionSlug,
  badge,
  onAddToCart,
  onVariantChange,
}: ProductInfoProps) {
  const { success, error } = useToast();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.find((v) => v.stock > 0)?.id ?? null
  );
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const isOnSale = compareAtPrice != null && compareAtPrice > price;
  const hasVariants = variants.length > 0;

  useEffect(() => {
    onVariantChange?.(selectedVariantId);
  }, [selectedVariantId, onVariantChange]);

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariantId) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 1000);
      return;
    }

    setAdding(true);
    try {
      await onAddToCart(id, selectedVariantId ?? "");
      setAdded(true);
      success("Added to bag", name);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      error("Could not add to bag", "Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="pdp-info" id="pdp-info">
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      {collectionName != null && collectionSlug != null && (
        <nav aria-label="Breadcrumb" className="pdp-breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="pdp-breadcrumb__link">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="pdp-breadcrumb__sep">
              /
            </li>
            <li>
              <Link href="/collections" className="pdp-breadcrumb__link">
                Collections
              </Link>
            </li>
            <li aria-hidden="true" className="pdp-breadcrumb__sep">
              /
            </li>
            <li>
              <Link
                href={`/collections/${collectionSlug}`}
                className="pdp-breadcrumb__link"
              >
                {collectionName}
              </Link>
            </li>
            <li aria-hidden="true" className="pdp-breadcrumb__sep">
              /
            </li>
            <li
              className="pdp-breadcrumb__current"
              aria-current="page"
            >
              {name}
            </li>
          </ol>
        </nav>
      )}

      {/* ── Badge + season eyebrow ───────────────────────────── */}
      <div className="flex items-center gap-3 mt-5 mb-3">
        {badge === "new" && (
          <span className="pdp-badge pdp-badge--new">New Arrival</span>
        )}
        {badge === "sale" && (
          <span className="pdp-badge pdp-badge--sale">On Sale</span>
        )}
        <span
          className="text-label text-[var(--text-tertiary)]"
          style={{ fontSize: "10px", letterSpacing: "0.16em" }}
        >
          SS25 COLLECTION
        </span>
      </div>

      {/* ── Product name ─────────────────────────────────────── */}
      <h1 className="pdp-name">{name}</h1>

      {/* ── Price block ──────────────────────────────────────── */}
      <div className="pdp-price-block">
        <span
          className={["pdp-price", isOnSale ? "pdp-price--sale" : ""].join(" ")}
        >
          {fmt(price, currency)}
        </span>
        {isOnSale && compareAtPrice != null && (
          <span className="pdp-compare-price">
            {fmt(compareAtPrice, currency)}
          </span>
        )}
        {isOnSale && compareAtPrice != null && (
          <span className="pdp-save-badge">
            Save {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}
            %
          </span>
        )}
      </div>

      {/* ── Size selector ────────────────────────────────────── */}
      {hasVariants && (
        <div className="pdp-size-section">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-label text-[var(--text-primary)]"
              style={{ fontSize: "11px", letterSpacing: "0.12em" }}
            >
              SELECT SIZE
            </span>
            <Link
              href="/size-guide"
              className="flex items-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              style={{
                fontSize: "11px",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              <Ruler size={11} strokeWidth={1.5} />
              Size Guide
            </Link>
          </div>

          <motion.div
            className="pdp-size-grid"
            animate={sizeError ? { x: [-4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              const isUnavailable = variant.stock === 0;

              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    if (!isUnavailable) {
                      setSelectedVariantId(variant.id);
                      setSizeError(false);
                    }
                  }}
                  disabled={isUnavailable}
                  aria-pressed={isSelected}
                  aria-label={`Size ${variant.size}${isUnavailable ? ", sold out" : ""}`}
                  className={[
                    "pdp-size-btn",
                    isSelected ? "pdp-size-btn--selected" : "",
                    isUnavailable ? "pdp-size-btn--unavailable" : "",
                  ].join(" ")}
                >
                  {variant.size}
                </button>
              );
            })}
          </motion.div>

          <AnimatePresence>
            {sizeError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[#c0392b] mt-2"
                style={{ fontSize: "12px" }}
              >
                Please select a size to continue
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Add to Bag CTA ───────────────────────────────────── */}
      <button
        id="pdp-add-btn"
        onClick={handleAddToCart}
        disabled={adding}
        className={[
          "pdp-add-btn",
          added ? "pdp-add-btn--added" : "",
          adding ? "pdp-add-btn--loading" : "",
        ].join(" ")}
        aria-label={
          added
            ? `${name} added to bag`
            : adding
              ? "Adding to bag…"
              : `Add ${name} to bag`
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Check size={16} strokeWidth={2} />
              Added to Bag
            </motion.span>
          ) : adding ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className="pdp-spinner" aria-hidden="true" />
              Adding…
            </motion.span>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              Add to Bag
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Trust micro-signals ──────────────────────────────── */}
      <div className="pdp-trust-row">
        <span className="pdp-trust-item">
          <Truck size={13} strokeWidth={1.5} />
          Free shipping over GHS ₵500
        </span>
        <span className="pdp-trust-sep" aria-hidden="true">
          ·
        </span>
        <span className="pdp-trust-item">
          <RotateCcw size={13} strokeWidth={1.5} />
          30-day returns
        </span>
      </div>

      {/* ── Description ─────────────────────────────────────── */}
      {description != null && description !== "" && (
        <p className="pdp-description">{description}</p>
      )}

      {/* ── Accordions ──────────────────────────────────────── */}
      <div className="pdp-accordions">
        <Accordion
          title="Shipping & Delivery"
          icon={<Truck size={14} strokeWidth={1.5} />}
          defaultOpen={false}
        >
          <div
            className="space-y-2 text-body-sm text-[var(--text-secondary)]"
            style={{ fontSize: "13px", lineHeight: "1.7" }}
          >
            <p>
              Free shipping on orders over{" "}
              <strong className="text-[var(--text-primary)] font-medium">
                GHS ₵500
              </strong>{" "}
              within Accra.
            </p>
            <p>
              Standard delivery:{" "}
              <strong className="text-[var(--text-primary)] font-medium">
                2–4 business days
              </strong>{" "}
              nationwide.
            </p>
            <p>
              Express delivery available at checkout for same-day delivery
              within Accra.
            </p>
          </div>
        </Accordion>

        <Accordion
          title="Size & Fit"
          icon={<Ruler size={14} strokeWidth={1.5} />}
          defaultOpen={false}
        >
          <div
            className="space-y-3 text-body-sm text-[var(--text-secondary)]"
            style={{ fontSize: "13px", lineHeight: "1.7" }}
          >
            <p>
              This style fits true to size. We recommend ordering your child's
              usual size.
            </p>
            <div className="pdp-size-table">
              <div className="pdp-size-table__row pdp-size-table__row--header">
                <span>Size</span>
                <span>Age</span>
                <span>Height</span>
                <span>Chest</span>
              </div>
              {[
                {
                  size: "XS",
                  age: "2–3 yrs",
                  height: "92–98cm",
                  chest: "52cm",
                },
                {
                  size: "S",
                  age: "4–5 yrs",
                  height: "104–110cm",
                  chest: "56cm",
                },
                {
                  size: "M",
                  age: "6–7 yrs",
                  height: "116–122cm",
                  chest: "60cm",
                },
                {
                  size: "L",
                  age: "8–9 yrs",
                  height: "128–134cm",
                  chest: "65cm",
                },
                {
                  size: "XL",
                  age: "10–11 yrs",
                  height: "140–146cm",
                  chest: "70cm",
                },
                {
                  size: "XXL",
                  age: "12 yrs",
                  height: "152cm+",
                  chest: "75cm",
                },
              ].map((row) => (
                <div key={row.size} className="pdp-size-table__row">
                  <span className="font-medium text-[var(--text-primary)]">
                    {row.size}
                  </span>
                  <span>{row.age}</span>
                  <span>{row.height}</span>
                  <span>{row.chest}</span>
                </div>
              ))}
            </div>
          </div>
        </Accordion>

        <Accordion
          title="Returns & Exchanges"
          icon={<RotateCcw size={14} strokeWidth={1.5} />}
          defaultOpen={false}
        >
          <div
            className="space-y-2 text-body-sm text-[var(--text-secondary)]"
            style={{ fontSize: "13px", lineHeight: "1.7" }}
          >
            <p>
              Free returns within{" "}
              <strong className="text-[var(--text-primary)] font-medium">
                30 days
              </strong>{" "}
              of delivery.
            </p>
            <p>Items must be unworn with original tags attached.</p>
            <p>
              <Link
                href="/returns-exchange"
                className="text-[var(--text-primary)] underline"
                style={{ textUnderlineOffset: "3px" }}
              >
                View full returns policy →
              </Link>
            </p>
          </div>
        </Accordion>
      </div>

      {/* ── Share ───────────────────────────────────────────── */}
      <div className="mt-6 pt-5 border-t border-[var(--border-default)]">
        <ShareButton name={name} />
      </div>
    </div>
  );
}
