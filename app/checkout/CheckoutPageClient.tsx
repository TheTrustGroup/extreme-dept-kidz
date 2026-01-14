"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { H1 } from "@/components/ui/typography";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { useCartStore } from "@/lib/stores/cart-store";
import { useRouter } from "next/navigation";
import type { CheckoutFormData } from "@/types/checkout";

const SHIPPING_METHODS = [
  { id: "standard" as const, price: 800 },
  { id: "express" as const, price: 1500 },
  { id: "overnight" as const, price: 2500 },
];

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

  const handleSubmit = async (data: CheckoutFormData): Promise<void> => {
    try {
      // Only handle MoMo payments for now
      if (data.payment.method !== "momo") {
        alert("MoMo payment is currently the only supported method. Please select MoMo.");
        return;
      }

      // Calculate total including shipping
      const cartTotal = useCartStore.getState().getTotal();
      const shippingPrice = SHIPPING_METHODS.find(m => m.id === shippingMethod)?.price || 0;
      const total = cartTotal + shippingPrice;

      // Generate order ID
      const orderId = `ORD-${Date.now()}`;

      // Extract phone number from shipping address
      const phoneNumber = data.shippingAddress.phone.replace(/\D/g, ''); // Remove non-digits
      
      // Initiate MoMo payment
      const response = await fetch('/api/payment/momo/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total / 100, // Convert cents to GHS
          phoneNumber: phoneNumber,
          orderId,
          customerName: `${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`,
          customerEmail: data.shippingAddress.email,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data?.referenceId) {
        alert(result.error || 'Payment initiation failed. Please try again.');
        return;
      }

      // Store reference ID for polling
      sessionStorage.setItem('paymentReferenceId', result.data.referenceId);
      sessionStorage.setItem('orderId', orderId);

      // Redirect to payment status page
      router.push(`/checkout/payment-status?ref=${result.data.referenceId}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
        <div className="mb-6 xs:mb-7 sm:mb-8">
          <H1 className="text-charcoal-900 text-2xl xs:text-3xl sm:text-4xl font-serif font-bold">
            Checkout
          </H1>
          <p className="mt-2 text-sm text-charcoal-600">
            Secure checkout guaranteed. Your information is protected.
          </p>
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

