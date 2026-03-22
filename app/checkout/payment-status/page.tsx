"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { BrandSpinner } from "@/components/ui/PageLoader";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();
  const reference =
    searchParams.get("reference") ??
    searchParams.get("trxref") ??
    searchParams.get("ref");
  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying"
  );
  const [orderRef, setOrderRef] = useState("");

  useEffect(() => {
    if (!reference) {
      router.replace("/checkout");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/payment/paystack/verify?reference=${encodeURIComponent(reference)}`
        );
        const data = (await res.json()) as {
          success?: boolean;
          status?: string;
          orderNumber?: string;
          orderId?: string;
        };

        if (cancelled) return;

        if (data.success && data.status === "success") {
          clearCart();
          sessionStorage.removeItem("pending_order");
          setOrderRef(data.orderNumber || data.orderId || reference);
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch {
        if (!cancelled) setStatus("failed");
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [reference, router, clearCart]);

  if (status === "verifying") {
    return (
      <div className="payment-status">
        <BrandSpinner />
        <p
          style={{
            textAlign: "center",
            marginTop: 16,
            fontFamily: "var(--font-montserrat)",
            fontSize: 12,
            letterSpacing: "0.1em",
            color: "var(--text-secondary)",
          }}
        >
          Verifying your payment...
        </p>
      </div>
    );
  }

  return (
    <div className="payment-status">
      <div className="payment-status__card">
        {status === "success" ? (
          <>
            <div className="payment-status__icon payment-status__icon--success">
              <CheckCircle size={40} strokeWidth={1.5} />
            </div>
            <h1 className="payment-status__title">Order Confirmed!</h1>
            <p className="payment-status__sub">
              Thank you for your order. We will contact you on WhatsApp to confirm your
              delivery details.
            </p>
            {orderRef && (
              <p className="payment-status__ref">
                Order ref: <strong>{orderRef}</strong>
              </p>
            )}
            <div className="payment-status__actions">
              <Link
                href="/collections/new-arrivals"
                className="btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="payment-status__icon payment-status__icon--failed">
              <XCircle size={40} strokeWidth={1.5} />
            </div>
            <h1 className="payment-status__title">Payment Failed</h1>
            <p className="payment-status__sub">
              Your payment was not completed. No charges were made.
            </p>
            <div className="payment-status__actions">
              <Link
                href="/checkout"
                className="btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                Try Again
              </Link>
              <Link
                href="/cart"
                className="btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                Back to Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="payment-status">
          <BrandSpinner />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
