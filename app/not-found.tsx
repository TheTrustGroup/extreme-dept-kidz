"use client";

import Link from "next/link";
import { Search, Home, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { H1, H2, Body } from "@/components/ui/typography";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export default function NotFound(): JSX.Element {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "min-h-screen pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16",
        theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
      )}
    >
      <Container size="lg">
        <div className="max-w-2xl mx-auto text-center py-16">
          {/* 404 Number */}
          <H1
            className={cn(
              "mb-4 text-6xl sm:text-7xl md:text-8xl font-serif font-bold",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}
          >
            404
          </H1>

          {/* Icon */}
          <div
            className={cn(
              "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center",
              theme === "dark"
                ? "bg-dark-bg-secondary text-dark-text-muted"
                : "bg-cream-100 text-charcoal-400"
            )}
          >
            <Search className="w-10 h-10" />
          </div>

          {/* Title */}
          <H2
            className={cn(
              "mb-4 text-2xl sm:text-3xl font-serif font-bold",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}
          >
            Page Not Found
          </H2>

          {/* Description */}
          <Body
            className={cn(
              "text-lg mb-8 max-w-md mx-auto",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Explore our collections or return to the homepage.
          </Body>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button variant="primary" size="lg" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/collections">
                <ShoppingBag className="w-4 h-4 mr-2" />
                View Collections
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div
            className={cn(
              "mt-12 pt-8 border-t",
              theme === "dark" ? "border-dark-border-glass" : "border-cream-200"
            )}
          >
            <Body
              className={cn(
                "text-sm mb-4",
                theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
              )}
            >
              Popular Pages
            </Body>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/collections/boys"
                className={cn(
                  "text-sm hover:underline",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                )}
              >
                Boys Collection
              </Link>
              <Link
                href="/collections/girls"
                className={cn(
                  "text-sm hover:underline",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                )}
              >
                Girls Collection
              </Link>
              <Link
                href="/style-guide"
                className={cn(
                  "text-sm hover:underline",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                )}
              >
                Style Guide
              </Link>
              <Link
                href="/about-us"
                className={cn(
                  "text-sm hover:underline",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                )}
              >
                About Us
              </Link>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
