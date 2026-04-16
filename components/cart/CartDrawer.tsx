"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, ArrowRight } from "lucide-react";
import { slideInRight, fadeIn } from "@/lib/motion";
import { useToast } from "@/lib/stores/toast-store";
import { FreeShippingBar } from "./FreeShippingBar";

// ─── Types ────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  imageUrl: string;
  imageAlt?: string;
  currency?: string;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (lineId: string, qty: number) => void;
  onRemove: (lineId: string) => void;
  onClearCart?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────
function fmt(n: number, cur = "₵") {
  return `${cur}${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─── Single line item ─────────────────────────────────────────────
function CartLineItem({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (lineId: string, qty: number) => void;
  onRemove: (lineId: string) => void;
}) {
  const cur = item.currency ?? "₵";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, transition: { duration: 0.18 } }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="cart-line-item"
    >
      <Link
        href={`/products/${item.slug}`}
        className="cart-line-item__thumb"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={item.imageUrl}
          alt={item.imageAlt ?? item.name}
          fill
          sizes="64px"
          className="object-cover object-center"
        />
      </Link>

      <div className="cart-line-item__info">
        <div className="cart-line-item__top">
          <Link href={`/products/${item.slug}`} className="cart-line-item__name">
            {item.name}
          </Link>
          <button
            className="cart-line-item__remove"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name} from cart`}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {item.variantName && (
          <p className="cart-line-item__variant">{item.variantName}</p>
        )}

        <div className="cart-line-item__bottom">
          <div
            className="cart-qty-stepper"
            role="group"
            aria-label={`Quantity for ${item.name}`}
          >
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
            <span
              className="cart-qty-value"
              aria-live="polite"
              aria-atomic="true"
            >
              {item.quantity}
            </span>
            <button
              className="cart-qty-btn"
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={12} strokeWidth={2} />
            </button>
          </div>

          <span className="cart-line-item__price">
            {fmt(item.price * item.quantity, cur)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────
function CartEmpty({ onClose }: { onClose: () => void }) {
  return (
    <div className="cart-empty">
      <ShoppingBag
        size={36}
        strokeWidth={1}
        className="text-[var(--text-tertiary)] mb-4"
      />
      <p className="cart-empty__title">Your bag is empty</p>
      <p className="cart-empty__desc">
        Add something beautiful for a young legend.
      </p>
      <button
        onClick={onClose}
        className="btn-primary mt-6 h-control-compact px-compact-6 text-compact-sm tracking-compact-label leading-compact-tight"
      >
        Start Shopping
      </button>
    </div>
  );
}

// ─── Main drawer ──────────────────────────────────────────────────
export default function CartDrawer({
  open,
  onClose,
  items,
  onUpdateQty,
  onRemove,
}: CartDrawerProps) {
  const { info } = useToast();
  const closeRef = useRef<HTMLButtonElement>(null);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleRemove = (lineId: string) => {
    const item = items.find((i) => i.id === lineId);
    onRemove(lineId);
    if (item) info("Removed from bag", item.name);
  };
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const currency = items[0]?.currency ?? "₵";

  useEffect(() => {
    if (open) {
      setTimeout(() => closeRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[195] bg-[var(--color-navy)]/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="drawer"
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          >
            <div className="cart-drawer__header">
              <div className="flex items-center gap-2">
                <h2 className="cart-drawer__title">Your Bag</h2>
                {itemCount > 0 && (
                  <span className="cart-drawer__count">{itemCount}</span>
                )}
              </div>
              <button
                ref={closeRef}
                className="icon-btn"
                onClick={onClose}
                aria-label="Close bag"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {items.length === 0 ? (
              <CartEmpty onClose={onClose} />
            ) : (
              <>
                <div className="cart-drawer__items">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartLineItem
                        key={item.id}
                        item={item}
                        onUpdateQty={onUpdateQty}
                        onRemove={handleRemove}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <div className="cart-drawer__footer">
                  <FreeShippingBar subtotal={subtotal} currency={currency} />

                  <div className="cart-summary">
                    <div className="cart-summary__row">
                      <span className="cart-summary__label">Subtotal</span>
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
                      <span className="cart-summary__total-label">Total</span>
                      <span className="cart-summary__total-value">
                        {fmt(subtotal, currency)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="cart-checkout-btn"
                    aria-label="Proceed to checkout"
                  >
                    Checkout
                    <ArrowRight size={15} strokeWidth={1.5} />
                  </Link>

                  <button onClick={onClose} className="cart-continue-btn">
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
