"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Pencil } from "lucide-react";
import type { CartItem } from "@/components/cart/CartDrawer";
import type { ShippingData } from "./ShippingStep";
import type { PaymentData } from "./PaymentStep";

interface ReviewStepProps {
  shipping: ShippingData;
  payment: PaymentData;
  items: CartItem[];
  total: number;
  currency: string;
  onBack: () => void;
  onPlace: () => Promise<void>;
  onEditStep: (step: 1 | 2) => void;
}

function fmt(n: number, cur = "₵") {
  return `${cur}${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="review-block">
      <div className="review-block__header">
        <h3 className="review-block__title">{title}</h3>
        <button
          className="review-block__edit"
          onClick={onEdit}
          aria-label={`Edit ${title}`}
        >
          <Pencil size={12} strokeWidth={1.5} />
          Edit
        </button>
      </div>
      <div className="review-block__content">{children}</div>
    </div>
  );
}

export default function ReviewStep({
  shipping,
  payment,
  items,
  total,
  currency,
  onBack,
  onPlace,
  onEditStep,
}: ReviewStepProps) {
  const [placing, setPlacing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);

  const handlePlace = async () => {
    if (!agreed) {
      setAgreeError(true);
      return;
    }
    setPlacing(true);
    try {
      await onPlace();
    } finally {
      setPlacing(false);
    }
  };

  const networkLabel = payment.momoNetwork
    ? {
        mtn: "MTN MoMo",
        vodafone: "Vodafone Cash",
        airteltigo: "AirtelTigo",
      }[payment.momoNetwork]
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <ReviewBlock title="Shipping address" onEdit={() => onEditStep(1)}>
        <p className="review-text">
          {shipping.firstName} {shipping.lastName}
        </p>
        <p className="review-text review-text--muted">{shipping.address}</p>
        <p className="review-text review-text--muted">
          {shipping.city}, {shipping.region}
        </p>
        <p className="review-text review-text--muted">{shipping.phone}</p>
        <p className="review-text review-text--muted">{shipping.email}</p>
        {shipping.note && (
          <p className="review-text review-text--muted mt-2">
            Note: {shipping.note}
          </p>
        )}
      </ReviewBlock>

      <ReviewBlock title="Payment" onEdit={() => onEditStep(2)}>
        {payment.method === "momo" ? (
          <>
            <p className="review-text">{networkLabel}</p>
            <p className="review-text review-text--muted">
              {payment.momoPhone}
            </p>
            <p
              className="review-text review-text--muted"
              style={{ color: "var(--color-gold)", marginTop: 4 }}
            >
              ✓ Payment prompt approved
            </p>
          </>
        ) : (
          <>
            <p className="review-text">
              Card ending ····{" "}
              {(payment.cardNumber || "").replace(/\s/g, "").slice(-4)}
            </p>
            <p className="review-text review-text--muted">
              {payment.cardName}
            </p>
          </>
        )}
      </ReviewBlock>

      <ReviewBlock
        title={`Items (${items.length})`}
        onEdit={() => {}}
      >
        <ul className="review-items">
          {items.map((item) => (
            <li key={item.id} className="review-item">
              <span className="review-item__name">{item.name}</span>
              {item.variantName && (
                <span className="review-item__variant">
                  {" "}
                  · {item.variantName}
                </span>
              )}
              <span className="review-item__qty"> × {item.quantity}</span>
              <span className="review-item__price ml-auto">
                {fmt(
                  item.price * item.quantity,
                  item.currency ?? currency
                )}
              </span>
            </li>
          ))}
        </ul>
      </ReviewBlock>

      <div className="review-total">
        <span className="review-total__label">Order Total</span>
        <span className="review-total__value">{fmt(total, currency)}</span>
      </div>

      <label
        className={["review-agree", agreeError ? "review-agree--error" : ""].join(
          " "
        )}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            if (e.target.checked) setAgreeError(false);
          }}
          className="review-agree__checkbox"
          aria-required="true"
        />
        <span className="review-agree__text">
          I agree to the{" "}
          <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">
            Privacy Policy
          </a>
        </span>
      </label>
      {agreeError && (
        <p className="floating-field__error mt-1">
          Please agree to the terms to continue
        </p>
      )}

      <div className="checkout-nav-row mt-6">
        <button
          className="checkout-back-btn"
          onClick={onBack}
          aria-label="Back to payment"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </button>
        <button
          className="checkout-place-btn"
          onClick={handlePlace}
          disabled={placing}
          style={{ flex: 1 }}
          aria-label="Place order"
        >
          {placing ? (
            <>
              <span
                className="pdp-spinner"
                style={{
                  borderColor: "rgba(250,248,245,0.3)",
                  borderTopColor: "rgba(250,248,245,0.9)",
                }}
              />
              Placing order…
            </>
          ) : (
            <>
              <ShoppingBag size={15} strokeWidth={1.5} />
              Place Order · {fmt(total, currency)}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
