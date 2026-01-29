import type { Metadata } from "next";
import { SizeGuidePageClient } from "./SizeGuidePageClient";

export const metadata: Metadata = {
  title: "Size Guide | Extreme Dept Kidz",
  description:
    "Size guide for Extreme Dept Kidz. Find the perfect fit with our age-to-size conversion chart for kids clothing.",
  keywords: [
    "size guide",
    "sizing",
    "kids sizes",
    "children's clothing sizes",
    "age to size",
    "size chart",
  ],
  alternates: {
    canonical: "/size-guide",
  },
  openGraph: {
    title: "Size Guide | Extreme Dept Kidz",
    description:
      "Find the perfect fit with our age-to-size conversion chart for kids clothing.",
    url: "https://extremedeptkidz.com/size-guide",
  },
};

/**
 * Size Guide Page
 * 
 * Age-to-size conversion chart and sizing information for kids clothing.
 */
export default function SizeGuidePage(): JSX.Element {
  return <SizeGuidePageClient />;
}
