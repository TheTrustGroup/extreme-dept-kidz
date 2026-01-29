import type { Metadata } from "next";
import { ShippingInfoPageClient } from "./ShippingInfoPageClient";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Shipping Information | Extreme Dept Kidz",
  description:
    "Shipping information for Extreme Dept Kidz. View shipping times, costs, and delivery options for Ghana and international orders.",
  keywords: [
    "shipping",
    "delivery",
    "shipping times",
    "shipping costs",
    "Ghana shipping",
    "international shipping",
  ],
  alternates: {
    canonical: "/shipping-info",
  },
  openGraph: {
    title: "Shipping Information | Extreme Dept Kidz",
    description:
      "Shipping information for Extreme Dept Kidz. View shipping times, costs, and delivery options.",
    url: "https://extremedeptkidz.com/shipping-info",
  },
};

/**
 * Shipping Info Page
 * 
 * Information about shipping times, costs, and delivery options.
 */
export default function ShippingInfoPage(): JSX.Element {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Shipping Info", url: "/shipping-info" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ShippingInfoPageClient />
    </>
  );
}
