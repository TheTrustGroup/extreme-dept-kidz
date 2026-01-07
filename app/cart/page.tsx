import type { Metadata } from "next";
import { CartPageClient } from "./CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart | Extreme Dept Kidz",
  description:
    "Review your shopping cart at Extreme Dept Kidz. Add items, update quantities, and proceed to checkout for premium kids fashion.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/cart",
  },
};

/**
 * Cart Page
 * 
 * Full cart page with items and order summary.
 */
export default function CartPage(): JSX.Element {
  return <CartPageClient />;
}

