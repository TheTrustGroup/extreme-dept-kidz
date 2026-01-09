"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps): JSX.Element {
  React.useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      console.error("Application error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
        <div className="max-w-2xl mx-auto text-center py-16">
          <H1 className="text-charcoal-900 mb-4 text-4xl sm:text-5xl font-serif font-bold">
            Something went wrong
          </H1>
          <Body className="text-lg text-charcoal-600 mb-8">
            We encountered an unexpected error. Please try again or return to the homepage.
          </Body>
          {process.env.NODE_ENV === "development" && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-mono text-red-900 break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" onClick={reset}>
              Try Again
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
