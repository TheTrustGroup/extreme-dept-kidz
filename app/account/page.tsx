import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account | Extreme Dept Kidz",
  description: "Manage your account, orders, and preferences.",
  alternates: {
    canonical: "https://extremedeptkidz.com/account",
  },
};

/**
 * Account Page
 * 
 * Placeholder account page. In production, this would include:
 * - Order history
 * - Account settings
 * - Address book
 * - Payment methods
 * - Wishlist
 */
export default function AccountPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
        <div className="max-w-2xl mx-auto text-center py-16">
          <H1 className="text-charcoal-900 mb-4 text-2xl xs:text-3xl sm:text-4xl">
            Account
          </H1>
          <Body className="text-lg text-charcoal-600 mb-8">
            Account management features are coming soon. Sign in to access your
            orders, saved addresses, and preferences.
          </Body>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/collections">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

