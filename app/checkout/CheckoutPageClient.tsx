"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";
import { CheckoutFormV2 } from "@/components/checkout/CheckoutFormV2";
import { CheckoutOrderSummary } from "@/components/checkout/CheckoutOrderSummary";
import { useCartStore } from "@/lib/stores/cart-store";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
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
  const { theme } = useTheme();
  const items = useCartStore((state) => state.items);
  const router = useRouter();
  const [shippingMethod, setShippingMethod] =
    React.useState<"standard" | "express" | "overnight">("standard");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout" },
  ];

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const handleSubmit = async (data: CheckoutFormData): Promise<void> => {
    try {
      const cartItems = useCartStore.getState().items;
      const shippingPrice = SHIPPING_METHODS.find(m => m.id === shippingMethod)?.price || 0;

      // 1. Create order in DB first (mission-critical: order exists before payment)
      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          size: item.selectedSize,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName: data.shippingAddress.firstName,
          lastName: data.shippingAddress.lastName,
          email: data.shippingAddress.email,
          phone: data.shippingAddress.phone,
          address: data.shippingAddress.address,
          apartment: data.shippingAddress.apartment,
          city: data.shippingAddress.city,
          state: data.shippingAddress.state,
          zipCode: data.shippingAddress.zipCode,
          country: data.shippingAddress.country,
        },
        billingAddress: data.payment.billingAddressSameAsShipping === false && data.payment.billingAddress
          ? {
              firstName: data.payment.billingAddress.firstName,
              lastName: data.payment.billingAddress.lastName,
              email: data.payment.billingAddress.email,
              phone: data.payment.billingAddress.phone,
              address: data.payment.billingAddress.address,
              apartment: data.payment.billingAddress.apartment,
              city: data.payment.billingAddress.city,
              state: data.payment.billingAddress.state,
              zipCode: data.payment.billingAddress.zipCode,
              country: data.payment.billingAddress.country,
            }
          : null,
        paymentMethod: data.payment.method,
        shippingAmount: shippingPrice,
        taxAmount: 0,
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const orderResult = await orderRes.json();
      if (!orderResult.success || !orderResult.data?.orderId) {
        alert(orderResult.error || "Could not create order. Please try again.");
        return;
      }

      const { orderId, orderNumber } = orderResult.data;
      const total = useCartStore.getState().getTotal() + shippingPrice;

      if (data.payment.method === "paystack") {
        const response = await fetch("/api/payment/paystack/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.shippingAddress.email,
            amount: total, // pesewas (GHS) / kobo (NGN)
            orderId, // DB order id = Paystack reference (for webhook/verify)
            currency: "GHS",
          }),
        });
        const result = await response.json();
        if (!result.success || !result.data?.authorizationUrl) {
          alert(result.error || "Payment initiation failed. Please try again.");
          return;
        }
        sessionStorage.setItem("paymentReferenceId", result.data.reference);
        sessionStorage.setItem("orderId", orderId);
        sessionStorage.setItem("orderNumber", orderNumber);
        window.location.href = result.data.authorizationUrl;
        return;
      }

      if (data.payment.method === "momo") {
        const phoneNumber = data.shippingAddress.phone.replace(/\D/g, "");
        const response = await fetch("/api/payment/momo/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total / 100,
            phoneNumber,
            orderId,
            customerName: `${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`,
            customerEmail: data.shippingAddress.email,
          }),
        });
        const result = await response.json();
        if (!result.success || !result.data?.referenceId) {
          alert(result.error || "Payment initiation failed. Please try again.");
          return;
        }
        sessionStorage.setItem("paymentReferenceId", result.data.referenceId);
        sessionStorage.setItem("orderId", orderId);
        sessionStorage.setItem("orderNumber", orderNumber);
        router.push(`/checkout/payment-status?ref=${result.data.referenceId}`);
        return;
      }

      alert("Please select Paystack or Mobile Money to continue.");
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className={cn(
      "min-h-screen pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16 transition-colors duration-300",
      theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
    )}>
      <Container size="lg">
        {/* Breadcrumb */}
        <div className="mb-6 sm:mb-8">
          <Breadcrumb items={breadcrumbItems} generateStructuredData={false} />
        </div>

        <div className="mb-6 xs:mb-7 sm:mb-8">
          <H1 className={cn(
            "text-2xl xs:text-3xl sm:text-4xl font-serif font-bold",
            theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
          )}>
            Checkout
          </H1>
          <Body className={cn(
            "mt-2 text-sm",
            theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
          )}>
            Secure checkout guaranteed. Your information is protected.
          </Body>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xs:gap-7 sm:gap-8 lg:gap-10 xl:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <CheckoutFormV2
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

