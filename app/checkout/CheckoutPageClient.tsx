"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { H1 } from "@/components/ui/typography";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { useCartStore } from "@/lib/stores/cart-store";
import { useRouter } from "next/navigation";

/**
 * Checkout Page Client Component
 */
export function CheckoutPageClient(): JSX.Element | null {
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const [shippingMethod, setShippingMethod] =
    React.useState<"standard" | "express" | "overnight">("standard");

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const handleSubmit = (_data: unknown): void => {
    // In production, send to payment processing API
    // await fetch('/api/checkout', { method: 'POST', body: JSON.stringify(data) });
    // Redirect to success page
    router.push("/checkout/success");
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
        <div className="mb-6 xs:mb-7 sm:mb-8">
          <H1 className="text-charcoal-900 text-2xl xs:text-3xl sm:text-4xl">Checkout</H1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xs:gap-7 sm:gap-8 lg:gap-10 xl:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <CheckoutForm
              onSubmit={handleSubmit}
              onShippingMethodChange={setShippingMethod}
            />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-20 xl:top-24">
              <CheckoutOrderSummary shippingMethod={shippingMethod} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

