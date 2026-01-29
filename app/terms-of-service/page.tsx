import type { Metadata } from "next";
import { TermsOfServicePageClient } from "./TermsOfServicePageClient";

export const metadata: Metadata = {
  title: "Terms of Service | Extreme Dept Kidz",
  description:
    "Terms of Service for Extreme Dept Kidz. Review our terms and conditions for using our website and services.",
  alternates: {
    canonical: "/terms-of-service",
  },
  openGraph: {
    title: "Terms of Service | Extreme Dept Kidz",
    description:
      "Review the terms and conditions for using Extreme Dept Kidz website and services.",
    url: "https://extremedeptkidz.com/terms-of-service",
  },
};

/**
 * Terms of Service Page
 * 
 * Comprehensive terms and conditions covering website use, purchases, and legal rights.
 */
export default function TermsOfServicePage(): JSX.Element {
  return <TermsOfServicePageClient />;
}
