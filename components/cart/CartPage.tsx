"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import type { CartItem } from "./CartDrawer";
import { useToast } from "@/lib/stores/toast-store";
import { FreeShippingBar } from "./FreeShippingBar";

interface CartPageProps {
  items: CartItem[];
  onUpdateQty: (lineId: string, qty: number) => void;
  onRemove: (lineId: string) => void;
}

function fmt(n: number, cur = "₵") {
  return `${cur}${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Promo code input ─────────────────────────────────────────────
function PromoCode() {
  const { error } = useToast();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "applied" | "error"
  >("idle");
  const [msg, setMsg] = useState("");

  const handleApply = async () => {
    if (!value.trim()) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 800));
    // Stub: always show error until promo API is wired
    setStatus("error");
    setMsg("Invalid promo code. Please check and try again.");
    error("Invalid code", "This promo code is not valid or has expired.");
    setTimeout(() => {
      setStatus("idle");
      setMsg("");
    }, 3000);
  };

  return (
    <div className="promo-section">
      <p className="promo-section__label">
        <Tag size={13} strokeWidth={1.5} />
        Promo Code
      </p>
      <div className="promo-input-row">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="ENTER CODE"
          className="promo-input"
          aria-label="Promo code"
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <button
          onClick={handleApply}
          disabled={status === "loading" || !value.trim()}
          className="promo-btn"
        >
          {status === "loading" ? "…" : "Apply"}
        </button>
      </div>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={[
            "mt-2 text-xs",
            status === "applied"
              ? "text-[var(--color-gold)]"
              : "text-[#c0392b]",
          ].join(" ")}
        >
          {msg}
        </motion.p>
      )}
    </div>
  );
}

export default function CartPage({
  items,
  onUpdateQty,
  onRemove,
}: CartPageProps) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const currency = items[0]?.currency ?? "₵";

  if (items.length === 0) {
    return (
      <div className="cart-page-empty">
        <ShoppingBag
          size={48}
          strokeWidth={0.8}
          className="text-[var(--text-tertiary)] mb-6"
        />
        <h1
          className="font-playfair text-[var(--text-primary)] mb-3"
          style={{
            fontSize: "clamp(28px, 4vw, 36px)",
            fontWeight: 400,
          }}
        >
          Your bag is empty
        </h1>
        <p
          className="text-[var(--text-tertiary)] mb-8"
          style={{
            fontSize: "15px",
            maxWidth: "320px",
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          Looks like you haven&apos;t added anything yet. Let&apos;s fix that.
        </p>
        <Link
          href="/collections/all"
          className="btn-primary"
          style={{ height: "52px", padding: "0 32px", fontSize: "12px" }}
        >
          Shop All
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container-luxury section">
      <div className="cart-page__header">
        <h1 className="cart-page__title">
          Your Bag
          <span className="cart-page__count">{itemCount}</span>
        </h1>
        <Link
          href="/collections/all"
          className="text-label text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          Continue Shopping
        </Link>
      </div>

      <div className="cart-page__grid">
        <div className="cart-page__items">
          <div className="cart-page__items-header hidden md:grid">
            <span>Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
          </div>

          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  x: 24,
                  transition: { duration: 0.2 },
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="cart-page__line-item"
              >
                <Link href={`/products/${item.slug}`} className="cart-page__thumb">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt ?? item.name}
                    fill
                    sizes="96px"
                    className="object-cover object-center"
                  />
                </Link>

                <div className="cart-page__item-info">
                  <Link
                    href={`/products/${item.slug}`}
                    className="cart-page__item-name"
                  >
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="cart-page__item-variant">{item.variantName}</p>
                  )}
                  <p className="cart-page__item-unit-price md:hidden">
                    {fmt(item.price, item.currency ?? currency)}
                  </p>
                </div>

                <div className="cart-page__qty-wrap">
                  <div className="cart-qty-stepper">
                    <button
                      className="cart-qty-btn"
                      onClick={() =>
                        item.quantity > 1
                          ? onUpdateQty(item.id, item.quantity - 1)
                          : onRemove(item.id)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} strokeWidth={2} />
                    </button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <div className="cart-page__item-total">
                  <span>
                    {fmt(
                      item.price * item.quantity,
                      item.currency ?? currency
                    )}
                  </span>
                  <button
                    className="cart-page__remove"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="cart-page__summary">
          <div className="cart-page__summary-inner">
            <h2 className="cart-page__summary-title">Order Summary</h2>

            <div className="mb-5">
              <FreeShippingBar subtotal={subtotal} currency={currency} />
            </div>

            <PromoCode />

            <div className="cart-summary mt-5">
              <div className="cart-summary__row">
                <span className="cart-summary__label">
                  Subtotal ({itemCount}{" "}
                  {itemCount === 1 ? "item" : "items"})
                </span>
                <span className="cart-summary__value">
                  {fmt(subtotal, currency)}
                </span>
              </div>
              <div className="cart-summary__row">
                <span className="cart-summary__label cart-summary__label--muted">
                  Shipping
                </span>
                <span className="cart-summary__value cart-summary__value--muted">
                  Calculated at checkout
                </span>
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <span className="cart-summary__total-label">
                  Estimated Total
                </span>
                <span className="cart-summary__total-value">
                  {fmt(subtotal, currency)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="cart-checkout-btn mt-5"
              style={{ display: "flex" }}
            >
              Proceed to Checkout
              <ArrowRight size={15} strokeWidth={1.5} />
            </Link>

            <p className="cart-trust-note">
              🔒 Secure checkout · SSL encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
