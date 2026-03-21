import type { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Your Bag | Extreme Dept Kidz",
  description: "Review your selected items and proceed to checkout.",
};

export default function CartRoute() {
  return <CartPageClient />;
}
