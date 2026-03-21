"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import OrderSummary from "@/components/checkout/OrderSummary";
import ShippingStep, { ShippingData } from "@/components/checkout/ShippingStep";
import PaymentStep, { PaymentData } from "@/components/checkout/PaymentStep";
import ReviewStep from "@/components/checkout/ReviewStep";
import type { CartItem as DrawerCartItem } from "@/components/cart/CartDrawer";
import type { CartItem as StoreCartItem } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useToast } from "@/lib/stores/toast-store";

function storeItemToDrawerItem(item: StoreCartItem): DrawerCartItem {
  const p = item.product;
  const priceCedis =
    typeof p.price === "number" ? p.price / 100 : Number(p.price) / 100;
  return {
    id: item.id ?? `cart-${p.id}-${item.selectedSize}`,
    productId: p.id,
    variantId: `${p.id}-${item.selectedSize}`,
    slug: p.slug,
    name: p.name,
    variantName: `Size: ${item.selectedSize}`,
    price: priceCedis,
    quantity: item.quantity,
    imageUrl: p.images?.[0]?.url ?? "/placeholder.jpg",
    imageAlt: p.images?.[0]?.alt ?? p.name,
    currency: "GHS ₵",
  };
}

const DEFAULT_SHIPPING: ShippingData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  note: "",
};

const DEFAULT_PAYMENT: PaymentData = {
  method: "momo",
  momoNetwork: "",
  momoPhone: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  cardName: "",
};

export default function CheckoutClient() {
  const router = useRouter();
  const { success, error } = useToast();
  const storeItems = useCartStore((s) => s.items);
  const items: DrawerCartItem[] = useMemo(
    () => storeItems.map(storeItemToDrawerItem),
    [storeItems]
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shipping, setShipping] = useState<ShippingData>(DEFAULT_SHIPPING);
  const [payment, setPayment] = useState<PaymentData>(DEFAULT_PAYMENT);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 500 ? ("free" as const) : null;
  const total =
    subtotal + (typeof shippingCost === "number" ? shippingCost : 0);
  const currency = "GHS ₵";

  const handlePlaceOrder = async () => {
    try {
      // Wire to your order creation API:
      // const res = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ shipping, payment, items }),
      // })
      // const order = await res.json()
      // router.push(`/checkout/success?order=${order.id}`)
      await new Promise((r) => setTimeout(r, 1500));
      success("Order placed!", "Check your email for confirmation.");
      router.push("/checkout/success");
    } catch (err) {
      console.error("Order placement failed:", err);
      error("Order failed", "Please try again or contact support.");
    }
  };

  return (
    <CheckoutLayout currentStep={step}>
      <div className="checkout-grid container-luxury">
        <div className="checkout-form-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <ShippingStep
                key="shipping"
                data={shipping}
                onChange={setShipping}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <PaymentStep
                key="payment"
                data={payment}
                onChange={setPayment}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
                total={total}
                currency={currency}
              />
            )}
            {step === 3 && (
              <ReviewStep
                key="review"
                shipping={shipping}
                payment={payment}
                items={items}
                total={total}
                currency={currency}
                onBack={() => setStep(2)}
                onPlace={handlePlaceOrder}
                onEditStep={(s) => setStep(s)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="checkout-summary-col">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shipping={shippingCost}
            currency={currency}
          />
        </div>
      </div>
    </CheckoutLayout>
  );
}
