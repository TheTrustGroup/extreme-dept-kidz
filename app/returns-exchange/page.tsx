import type { Metadata } from "next";
import { ReturnsExchangePageClient } from "./ReturnsExchangePageClient";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Returns & Exchange | Extreme Dept Kidz",
  description:
    "Returns and exchange policy for Extreme Dept Kidz. Learn about our 30-day return policy, conditions, and how to initiate a return or exchange.",
  keywords: [
    "returns",
    "exchange",
    "return policy",
    "refund",
    "30-day return",
  ],
  alternates: {
    canonical: "/returns-exchange",
  },
  openGraph: {
    title: "Returns & Exchange | Extreme Dept Kidz",
    description:
      "Returns and exchange policy for Extreme Dept Kidz. Learn about our 30-day return policy.",
    url: "https://extremedeptkidz.com/returns-exchange",
  },
};

/**
 * Returns & Exchange Page
 * 
 * Information about returns and exchange policy, process, and conditions.
 */
export default function ReturnsExchangePage(): JSX.Element {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Returns & Exchange", url: "/returns-exchange" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ReturnsExchangePageClient />
    </>
  );
}
