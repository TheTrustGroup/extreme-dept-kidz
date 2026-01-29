import type { Metadata } from "next";
import { AccessibilityPageClient } from "./AccessibilityPageClient";

export const metadata: Metadata = {
  title: "Accessibility Statement | Extreme Dept Kidz",
  description:
    "Accessibility statement for Extreme Dept Kidz. Learn about our commitment to making our website accessible to everyone.",
  alternates: {
    canonical: "/accessibility",
  },
  openGraph: {
    title: "Accessibility Statement | Extreme Dept Kidz",
    description:
      "Learn about Extreme Dept Kidz&apos;s commitment to digital accessibility and WCAG compliance.",
    url: "https://extremedeptkidz.com/accessibility",
  },
};

/**
 * Accessibility Page
 * 
 * Comprehensive accessibility statement covering commitment, standards, and features.
 */
export default function AccessibilityPage(): JSX.Element {
  return <AccessibilityPageClient />;
}
