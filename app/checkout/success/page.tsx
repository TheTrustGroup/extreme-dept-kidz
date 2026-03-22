"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, MessageCircle } from "lucide-react";

function OrderSuccessInner() {
  const p = useSearchParams();
  const ref = p.get("ref") || "";
  const name = p.get("name") || "there";
  const isPod = p.get("method") === "pod";

  const waMsg = encodeURIComponent(
    `Hi! I just placed an order (${ref}) on Extreme Dept Kidz. Please confirm my delivery.`
  );
  const waPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "233000000000";
  const waUrl = `https://wa.me/${waPhone}?text=${waMsg}`;

  return (
    <div className="payment-status">
      <div className="payment-status__card">
        <div className="payment-status__icon payment-status__icon--success">
          <CheckCircle size={40} strokeWidth={1.5} />
        </div>
        <h1 className="payment-status__title">Thank you, {name}!</h1>
        <p className="payment-status__sub">
          {isPod
            ? "Your order has been placed. Our team will call you to confirm delivery and payment."
            : "Your order has been confirmed. We will contact you to arrange delivery."}
        </p>
        {ref && (
          <p className="payment-status__ref">
            Order ref: <strong>{ref}</strong>
          </p>
        )}
        <div className="payment-status__actions">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <MessageCircle size={16} />
            Message us on WhatsApp
          </a>
          <Link
            href="/"
            className="btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="payment-status min-h-screen" />}>
      <OrderSuccessInner />
    </Suspense>
  );
}
