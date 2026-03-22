"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck, CreditCard } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import CustomerForm, {
  type CustomerInfo,
} from "@/components/checkout/CustomerForm";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import type { ProductImage } from "@/types";

const EMPTY_CUSTOMER: CustomerInfo = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  notes: "",
};

type PaymentMethod = "paystack" | "pay_on_delivery";

function normalizeGhanaPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("233")) return d;
  if (d.length === 9) return `233${d}`;
  if (d.length === 10 && d.startsWith("0")) return `233${d.slice(1)}`;
  return d.length >= 10 ? d : `233${d}`;
}

function validate(info: CustomerInfo, method: PaymentMethod) {
  const errs: Partial<Record<keyof CustomerInfo, string>> = {};
  if (!info.firstName.trim()) errs.firstName = "First name is required";
  if (!info.lastName.trim()) errs.lastName = "Last name is required";
  if (!info.email.trim() || !/\S+@\S+\.\S+/.test(info.email)) {
    errs.email = "Valid email is required";
  }
  if (!info.phone.trim() || info.phone.replace(/\D/g, "").length < 9) {
    errs.phone = "Valid phone number is required";
  }
  if (!info.address.trim()) errs.address = "Delivery address is required";
  if (!info.city.trim()) errs.city = "City is required";
  if (!info.region) errs.region = "Please select your region";
  if (method === "pay_on_delivery" && info.region !== "Greater Accra") {
    errs.region = "Pay on delivery is only available for Greater Accra";
  }
  return errs;
}

export default function CheckoutClient() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [customer, setCustomer] = useState<CustomerInfo>(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerInfo, string>>
  >({});
  const [method, setMethod] = useState<PaymentMethod>("paystack");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getTotal();
  const isFreeShip = subtotal >= 50000;
  const shippingCost = isFreeShip ? 0 : 2000;
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

  const buildOrderPayload = (paymentMethod: "paystack" | "pay_on_delivery") => {
    const phone = normalizeGhanaPhone(customer.phone);
    const addressLine = customer.notes.trim()
      ? `${customer.address.trim()}\nNotes: ${customer.notes.trim()}`
      : customer.address.trim();

    return {
      items: items.map((item) => ({
        productId: item.product.id,
        size: item.selectedSize,
        quantity: item.quantity,
      })),
      shippingAddress: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        email: customer.email.trim(),
        phone,
        address: addressLine,
        city: customer.city.trim(),
        state: customer.region,
        zipCode: "00000",
        country: "Ghana",
      },
      billingAddress: null,
      paymentMethod,
      shippingAmount: shippingCost,
      taxAmount: 0,
    };
  };

  const handleSubmit = async () => {
    const errs = validate(customer, method);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const el = document.querySelector(".checkout-form__input--error");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setLoading(true);
    setError(null);

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildOrderPayload(method)),
      });
      const orderJson = (await orderRes.json()) as {
        success?: boolean;
        data?: { orderId: string; orderNumber: string; total: number };
        error?: string;
      };

      if (!orderJson.success || !orderJson.data?.orderId) {
        throw new Error(orderJson.error || "Could not create order. Please try again.");
      }

      const { orderId, orderNumber } = orderJson.data;

      if (method === "pay_on_delivery") {
        clearCart();
        router.push(
          `/checkout/success?ref=${encodeURIComponent(orderNumber)}&method=pod&name=${encodeURIComponent(customer.firstName)}`
        );
        return;
      }

      const res = await fetch("/api/payment/paystack/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customer.email.trim(),
          amount: total,
          orderId,
          customerInfo: customer,
          cartItems,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        authorizationUrl?: string;
        reference?: string;
        error?: string;
      };

      if (!data.success || !data.authorizationUrl) {
        throw new Error(data.error || "Payment initiation failed");
      }

      sessionStorage.setItem(
        "pending_order",
        JSON.stringify({
          orderId,
          orderNumber,
          customer,
          cartItems,
          total,
          reference: data.reference,
        })
      );

      window.location.href = data.authorizationUrl;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="container-luxury checkout-header__inner">
          <Link href="/cart" className="checkout-header__back">
            <ArrowLeft size={16} />
            Back to cart
          </Link>
          <div className="checkout-header__secure">
            <ShieldCheck size={14} />
            Secure checkout
          </div>
        </div>
      </header>

      <div className="container-luxury checkout-body">
        <div className="checkout-left">
          <CustomerForm value={customer} onChange={setCustomer} errors={errors} />

          <div className="checkout-payment">
            <h2 className="checkout-form__title">Payment Method</h2>

            <div className="checkout-payment__options">
              <label
                className={[
                  "checkout-payment__option",
                  method === "paystack" ? "checkout-payment__option--active" : "",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="payment"
                  value="paystack"
                  checked={method === "paystack"}
                  onChange={() => setMethod("paystack")}
                  className="sr-only"
                />
                <CreditCard size={18} />
                <div>
                  <p className="checkout-payment__label">Pay Online</p>
                  <p className="checkout-payment__sub">
                    Card, Mobile Money (MTN, Vodafone, AirtelTigo)
                  </p>
                </div>
                <div className="checkout-payment__logos">
                  <span className="checkout-payment__logo-tag">Paystack</span>
                </div>
              </label>

              <label
                className={[
                  "checkout-payment__option",
                  method === "pay_on_delivery" ? "checkout-payment__option--active" : "",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="payment"
                  value="pay_on_delivery"
                  checked={method === "pay_on_delivery"}
                  onChange={() => setMethod("pay_on_delivery")}
                  className="sr-only"
                />
                <Truck size={18} />
                <div>
                  <p className="checkout-payment__label">Pay on Delivery</p>
                  <p className="checkout-payment__sub">
                    Cash on delivery · Greater Accra only
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="checkout-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="button"
              className="checkout-cta"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="checkout-cta__spinner" />
              ) : method === "paystack" ? (
                "Proceed to Payment"
              ) : (
                "Place Order"
              )}
            </button>

            <p className="checkout-trust">
              <ShieldCheck size={13} />
              Your information is secure and encrypted
            </p>
          </div>
        </div>

        <div className="checkout-right">
          <CheckoutOrderSummary
            items={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
