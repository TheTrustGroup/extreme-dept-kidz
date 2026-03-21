import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Extreme Dept Kidz",
  description:
    "Complete your purchase at Extreme Dept Kidz. Secure checkout with multiple shipping options and payment methods.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/checkout" },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}

