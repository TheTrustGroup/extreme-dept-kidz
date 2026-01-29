import type { Metadata } from "next";
import { PrivacyPolicyPageClient } from "./PrivacyPolicyPageClient";

export const metadata: Metadata = {
  title: "Privacy Policy | Extreme Dept Kidz",
  description:
    "Privacy Policy for Extreme Dept Kidz. Learn how we collect, use, and protect your personal information.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Extreme Dept Kidz",
    description:
      "Learn how Extreme Dept Kidz collects, uses, and protects your personal information.",
    url: "https://extremedeptkidz.com/privacy-policy",
  },
};

/**
 * Privacy Policy Page
 * 
 * Comprehensive privacy policy covering data collection, usage, and user rights.
 */
export default function PrivacyPolicyPage(): JSX.Element {
  return <PrivacyPolicyPageClient />;
}
