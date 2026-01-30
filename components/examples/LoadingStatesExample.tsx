"use client";

/**
 * LoadingStatesExample Component
 * 
 * Example integration showing all loading states and error handling.
 * This file demonstrates how to use the new loading and error components.
 */

import * as React from "react";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/ui/ProductGridSkeleton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageLoadingBar } from "@/components/ui/PageLoadingBar";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ProductErrorBoundary } from "@/components/errors/ProductErrorBoundary";
import { NetworkError } from "@/components/errors/NetworkError";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { useOptimisticCart } from "@/lib/hooks/useOptimisticCart";
import { useOptimisticWishlist } from "@/lib/hooks/useOptimisticWishlist";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/types";

// ============================================================================
// Example 1: Product Grid with Loading State
// ============================================================================
export function ProductGridWithLoadingExample(): JSX.Element {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // Example: simulate loading (no client fetch — product data is server-only)
    const t = setTimeout(() => {
      setProducts([]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  if (error) {
    return (
      <ProductErrorBoundary onRetry={() => window.location.reload()}>
        <div>Error loading products</div>
      </ProductErrorBoundary>
    );
  }

  return (
    <div>
      {/* Show skeleton while loading */}
      {isLoading ? (
        <ProductGridSkeleton count={8} columns={{ mobile: 2, tablet: 3, desktop: 4 }} />
      ) : (
        <ProductGrid products={products} isLoading={isLoading} columns={4} />
      )}
    </div>
  );
}

// ============================================================================
// Example 2: Button with Loading Spinner
// ============================================================================
export function ButtonWithLoadingExample(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { optimisticAddToCart } = useOptimisticCart();
  const { addToast } = useToast();

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      addToast({
        type: "success",
        title: "Success",
        message: "Form submitted successfully!",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handleSubmit}
      loading={isSubmitting}
      loadingText="Submitting..."
      disabled={isSubmitting}
    >
      Submit Form
    </Button>
  );
}

// ============================================================================
// Example 3: Optimistic Add to Cart
// ============================================================================
export function OptimisticCartExample({ product }: { product: Product }): JSX.Element {
  const [isAdding, setIsAdding] = React.useState(false);
  const { optimisticAddToCart } = useOptimisticCart();

  const handleAddToCart = async (): Promise<void> => {
    setIsAdding(true);
    await optimisticAddToCart(
      product,
      "M", // size
      1, // quantity
      {
        showToast: true,
        toastMessage: `${product.name} added to cart`,
        onSuccess: () => {
          setIsAdding(false);
        },
        onError: () => {
          setIsAdding(false);
        },
      }
    );
  };

  return (
    <Button
      variant="primary"
      onClick={handleAddToCart}
      loading={isAdding}
      disabled={isAdding}
    >
      Add to Cart
    </Button>
  );
}

// ============================================================================
// Example 4: Optimistic Wishlist Toggle
// ============================================================================
export function OptimisticWishlistExample({ product }: { product: Product }): JSX.Element {
  const { optimisticToggleWishlist, isInWishlist } = useOptimisticWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleToggle = async (): Promise<void> => {
    await optimisticToggleWishlist(product, {
      showToast: true,
      addToastMessage: `${product.name} added to wishlist`,
      removeToastMessage: `${product.name} removed from wishlist`,
    });
  };

  return (
    <Button variant="ghost" onClick={handleToggle}>
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}

// ============================================================================
// Example 5: Image with Error Fallback
// ============================================================================
export function ImageWithErrorFallbackExample(): JSX.Element {
  return (
    <div className="w-full aspect-square">
      <ImagePlaceholder
        src="/placeholder.jpg"
        alt="Product image"
        fill
        showPulse={true}
        onError={() => {
          console.log("Image failed to load");
        }}
      />
    </div>
  );
}

// ============================================================================
// Example 6: Network Error Handling
// ============================================================================
export function NetworkErrorExample(): JSX.Element {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // Example: simulate network error (no client fetch)
    const t = setTimeout(() => setHasError(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (hasError) {
    return (
      <NetworkError
        message="Unable to load products. Please check your connection."
        onRetry={() => window.location.reload()}
        showHomeLink={true}
      />
    );
  }

  return <div>Content loaded successfully</div>;
}

// ============================================================================
// Example 7: Full Page with All States
// ============================================================================
export function FullPageExample(): JSX.Element {
  return (
    <>
      {/* Page loading bar for route transitions */}
      <PageLoadingBar />

      {/* Error boundary wraps entire page */}
      <ProductErrorBoundary>
        <Suspense
          fallback={
            <div className="py-12">
              <LoadingSpinner size="lg" text="Loading products..." />
            </div>
          }
        >
          <ProductGridWithLoadingExample />
        </Suspense>
      </ProductErrorBoundary>
    </>
  );
}
