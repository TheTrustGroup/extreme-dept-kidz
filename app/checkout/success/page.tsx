"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export default function CheckoutSuccessPage(): JSX.Element {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "min-h-screen pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16",
        theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
      )}
    >
      <Container size="lg">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6",
              theme === "dark" ? "bg-green-900/30" : "bg-green-100"
            )}
          >
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <H1
            className={cn(
              "mb-4",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}
          >
            Order confirmed
          </H1>
          <Body
            className={cn(
              "mb-8",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}
          >
            Thank you for your purchase. We&apos;ll send order details to your email.
          </Body>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/">Continue shopping</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/orders">View orders</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
