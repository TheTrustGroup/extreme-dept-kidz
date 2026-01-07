import type { Metadata } from "next";
import { CheckoutPageClient } from "./CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout | Extreme Dept Kidz",
  description:
    "Complete your purchase at Extreme Dept Kidz. Secure checkout with multiple shipping options and payment methods.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/checkout",
  },
};

/**
 * Checkout Page
 * 
 * Multi-step checkout form with order summary.
 */
export default function CheckoutPage(): JSX.Element {
  return <CheckoutPageClient />;
}

