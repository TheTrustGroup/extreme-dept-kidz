import type { Metadata } from "next";
import { ContactPageClient } from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us | Extreme Dept Kidz",
  description:
    "Get in touch with Extreme Dept Kidz. Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
  keywords: [
    "contact",
    "customer service",
    "help",
    "support",
    "luxury kids fashion",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Extreme Dept Kidz",
    description:
      "Get in touch with Extreme Dept Kidz. Have a question? We'd love to hear from you.",
    url: "https://extremedeptkidz.com/contact",
  },
};

/**
 * Contact Page
 * 
 * Contact page with form, contact information, and FAQ section.
 */
export default function ContactPage(): JSX.Element {
  return <ContactPageClient />;
}
