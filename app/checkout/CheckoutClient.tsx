"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck, Package } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import CustomerForm from "@/components/checkout/CustomerForm";
import type { CustomerInfo } from "@/components/checkout/CustomerForm";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import type { ProductImage } from "@/types";

const EMPTY: CustomerInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  notes: "",
};

function validate(info: CustomerInfo) {
  const e: Partial<Record<keyof CustomerInfo, string>> = {};
  if (!info.firstName.trim()) e.firstName = "Required";
  if (!info.lastName.trim()) e.lastName = "Required";
  if (!info.phone.trim() || info.phone.replace(/\D/g, "").length < 9)
    e.phone = "Enter a valid phone number";
  return e;
}

export default function CheckoutClient() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [customer, setCustomer] = useState<CustomerInfo>(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerInfo, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"info" | "confirm">("info");

  const subtotal = getTotal();
  const isFreeShip = subtotal >= 50000;
  const shippingCost = isFreeShip ? 0 : 0;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  const cartItems = items.map((item) => {
    const primary =
      item.product.images.find((img) => (img as ProductImage).isPrimary) ||
      item.product.images[0];
    return {
      id: item.id ?? `${item.product.id}-${item.selectedSize}`,
      name: item.product.name,
      imageUrl: primary?.url ?? "",
      price: item.product.price,
      quantity: item.quantity,
      size: item.selectedSize,
    };
  });

  const handleContinue = () => {
    const errs = validate(customer);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const el = document.querySelector(".checkout-form__input--error");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setStep("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const orderId = `EDK-${Date.now()}`;

    try {
      sessionStorage.setItem(
        "edk_last_order",
        JSON.stringify({
          orderId,
          customer,
          cartItems,
          total,
          method: "cash_on_delivery",
          placedAt: new Date().toISOString(),
        })
      );

      clearCart();

      router.push(
        `/checkout/success?ref=${encodeURIComponent(orderId)}` +
          `&name=${encodeURIComponent(customer.firstName)}` +
          `&method=cod`
      );
    } catch {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="container-luxury checkout-header__inner">
          {step === "confirm" ? (
            <button
              type="button"
              onClick={() => setStep("info")}
              className="checkout-header__back"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={15} />
              Edit details
            </button>
          ) : (
            <Link href="/cart" className="checkout-header__back">
              <ArrowLeft size={15} />
              Back to cart
            </Link>
          )}
          <div className="checkout-header__secure">
            <ShieldCheck size={13} />
            Secure checkout
          </div>
        </div>
      </header>

      <div
        style={{
          borderBottom: "1px solid var(--border-default)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        <div
          className="container-luxury"
          style={{
            display: "flex",
            gap: 0,
            maxWidth: 680,
          }}
        >
          {["Delivery Details", "Confirm Order"].map((s, i) => {
            const active =
              (i === 0 && step === "info") || (i === 1 && step === "confirm");
            const done = i === 0 && step === "confirm";
            return (
              <div
                key={s}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  textAlign: "center",
                  fontFamily: "var(--font-montserrat)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: active
                    ? "var(--color-navy)"
                    : done
                      ? "var(--color-gold)"
                      : "var(--text-tertiary)",
                  borderBottom: active
                    ? "2px solid var(--color-navy)"
                    : done
                      ? "2px solid var(--color-gold)"
                      : "2px solid transparent",
                  transition: "all 200ms ease",
                }}
              >
                {done ? "✓ " : ""}
                {s}
              </div>
            );
          })}
        </div>
      </div>

      <div className="container-luxury checkout-body">
        <div className="checkout-left">
          {step === "info" ? (
            <>
              <CustomerForm
                value={customer}
                onChange={setCustomer}
                errors={errors}
              />
              <button
                type="button"
                className="checkout-cta"
                onClick={handleContinue}
                style={{ marginTop: 8 }}
              >
                Continue to Confirm
              </button>
            </>
          ) : (
            <div>
              <div
                style={{
                  border: "1px solid var(--border-default)",
                  padding: "20px",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-montserrat)",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      margin: 0,
                    }}
                  >
                    Delivering to
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep("info")}
                    style={{
                      background: "none",
                      border: "none",
                      fontFamily: "var(--font-montserrat)",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-gold)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Edit
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "0 0 4px",
                  }}
                >
                  {customer.firstName} {customer.lastName}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    margin: "0 0 2px",
                    lineHeight: 1.5,
                  }}
                >
                  {customer.phone}
                </p>
                {customer.address && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      margin: "0 0 2px",
                    }}
                  >
                    {customer.address}
                    {customer.city ? `, ${customer.city}` : ""}
                    {customer.region ? `, ${customer.region}` : ""}
                  </p>
                )}
                {customer.email && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-tertiary)",
                      margin: "6px 0 0",
                    }}
                  >
                    {customer.email}
                  </p>
                )}
              </div>

              <div
                style={{
                  border: "1px solid var(--border-default)",
                  padding: "20px",
                  marginBottom: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    margin: "0 0 14px",
                  }}
                >
                  Payment
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(15,23,42,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Truck size={18} style={{ color: "var(--color-navy)" }} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: "0 0 3px",
                      }}
                    >
                      Cash on Delivery
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        margin: 0,
                      }}
                    >
                      Pay when your order arrives. Our team will contact you to
                      confirm.
                    </p>
                  </div>
                </div>
              </div>

              {customer.notes && (
                <div
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    padding: "14px 16px",
                    marginBottom: 20,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat)",
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Order Notes
                  </span>
                  {customer.notes}
                </div>
              )}

              <button
                type="button"
                className="checkout-cta"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <span className="checkout-cta__spinner" />
                ) : (
                  <>
                    <Package size={15} />
                    Place Order — Cash on Delivery
                  </>
                )}
              </button>

              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                  marginTop: 12,
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                <ShieldCheck size={12} />
                By placing your order you agree to our terms. We will call to
                confirm delivery.
              </p>
            </div>
          )}
        </div>

        <div className="checkout-right">
          <CheckoutOrderSummary
            items={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
          />

          <div
            style={{
              marginTop: 16,
              border: "1px solid var(--border-default)",
              padding: "16px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginBottom: 12,
              }}
            >
              What happens next
            </p>
            {[
              {
                n: "1",
                t: "Order confirmed",
                s: "You receive an order reference immediately.",
              },
              {
                n: "2",
                t: "We call you",
                s: "Our team confirms your delivery details.",
              },
              {
                n: "3",
                t: "We deliver",
                s: "Pay cash when your order arrives.",
              },
            ].map(({ n, t, s }) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--color-navy)",
                    color: "var(--color-cream)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {n}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: "0 0 2px",
                    }}
                  >
                    {t}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {s}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
