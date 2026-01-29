"use client";

import * as React from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { H2, Body } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";

interface ProductErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

interface ProductErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ProductErrorBoundary Component
 * 
 * Error boundary specifically for product-related errors.
 * Shows user-friendly error message with retry option.
 */
export class ProductErrorBoundary extends React.Component<
  ProductErrorBoundaryProps,
  ProductErrorBoundaryState
> {
  constructor(props: ProductErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ProductErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Product Error Boundary caught error:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ProductErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ProductErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

function ProductErrorFallback({
  error,
  onRetry,
}: ProductErrorFallbackProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4",
          theme === "dark"
            ? "bg-red-900/20 text-red-400"
            : "bg-red-50 text-red-600"
        )}
      >
        <AlertCircle className="w-8 h-8" />
      </div>

      <H2 className={cn(
        "mb-2 text-xl",
        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
      )}>
        Unable to Load Products
      </H2>

      <Body className={cn(
        "mb-6 max-w-md",
        theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
      )}>
        We encountered an error while loading products. Please try again or
        continue browsing.
      </Body>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" onClick={onRetry} className="min-w-[120px]">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/collections">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse Collections
          </Link>
        </Button>
      </div>

      {process.env.NODE_ENV === "development" && error && (
        <details className="mt-6 text-left max-w-2xl w-full">
          <summary className={cn(
            "cursor-pointer text-sm mb-2",
            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
          )}>
            Error Details (Development Only)
          </summary>
          <pre
            className={cn(
              "p-4 rounded-lg text-xs overflow-auto max-h-64",
              theme === "dark"
                ? "bg-dark-bg-secondary text-dark-text-primary"
                : "bg-cream-100 text-charcoal-900"
            )}
          >
            {error.toString()}
            {"\n\n"}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
