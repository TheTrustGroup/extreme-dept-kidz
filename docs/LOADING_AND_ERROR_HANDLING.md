# Loading States and Error Handling Guide

This document provides a comprehensive guide to using loading states, error boundaries, optimistic UI, and toast notifications across the site.

## Table of Contents

1. [Loading Components](#loading-components)
2. [Error Boundaries](#error-boundaries)
3. [Optimistic UI](#optimistic-ui)
4. [Toast Notifications](#toast-notifications)
5. [Integration Examples](#integration-examples)

---

## Loading Components

### 1. ProductGridSkeleton

Skeleton loader for product grids with shimmer animation.

```tsx
import { ProductGridSkeleton } from "@/components/ui/ProductGridSkeleton";

<ProductGridSkeleton
  count={8}
  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
/>
```

**Props:**
- `count?: number` - Number of skeleton cards (default: 4)
- `columns?: { mobile?: number; tablet?: number; desktop?: number }` - Responsive columns
- `className?: string` - Custom className

### 2. LoadingSpinner

Reusable spinner for loading states.

```tsx
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

<LoadingSpinner size="md" text="Loading..." />
<LoadingSpinner size="lg" fullScreen />
```

**Props:**
- `size?: "sm" | "md" | "lg"` - Spinner size (default: "md")
- `className?: string` - Custom className
- `text?: string` - Text below spinner
- `fullScreen?: boolean` - Full screen overlay

### 3. PageLoadingBar

Top loading bar for page transitions (like YouTube/Medium).

```tsx
import { PageLoadingBar } from "@/components/ui/PageLoadingBar";

// Already integrated in app/layout.tsx
<PageLoadingBar />
```

Automatically shows progress during route changes.

### 4. ImagePlaceholder

Enhanced Image component with error handling and pulse animation.

```tsx
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

<ImagePlaceholder
  src="/product.jpg"
  alt="Product"
  width={400}
  height={400}
  showPulse={true}
  onError={() => console.log("Image failed")}
/>
```

**Props:**
- All Next.js Image props
- `showPulse?: boolean` - Show pulse animation while loading (default: true)
- `onError?: () => void` - Error callback

---

## Error Boundaries

### 1. ProductErrorBoundary

Error boundary specifically for product-related errors.

```tsx
import { ProductErrorBoundary } from "@/components/errors/ProductErrorBoundary";

<ProductErrorBoundary onRetry={() => refetch()}>
  <ProductGrid products={products} />
</ProductErrorBoundary>
```

**Props:**
- `children: React.ReactNode` - Content to wrap
- `fallback?: React.ReactNode` - Custom fallback UI
- `onRetry?: () => void` - Retry callback

### 2. NetworkError

Displays offline/network error message with retry option.

```tsx
import { NetworkError } from "@/components/errors/NetworkError";

<NetworkError
  message="Unable to load products"
  onRetry={() => window.location.reload()}
  showHomeLink={true}
/>
```

**Props:**
- `message?: string` - Error message (default: "You appear to be offline")
- `onRetry?: () => void` - Retry callback
- `showHomeLink?: boolean` - Show home link (default: true)
- `className?: string` - Custom className

### 3. Enhanced 404 Page

Custom 404 page with navigation options.

Located at `app/not-found.tsx` - automatically used by Next.js for 404 errors.

---

## Optimistic UI

### useOptimisticCart Hook

Provides optimistic UI updates for cart operations.

```tsx
import { useOptimisticCart } from "@/lib/hooks/useOptimisticCart";

function AddToCartButton({ product }: { product: Product }) {
  const { optimisticAddToCart } = useOptimisticCart();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    await optimisticAddToCart(
      product,
      "M", // size
      1, // quantity
      {
        showToast: true,
        toastMessage: `${product.name} added to cart`,
        onSuccess: () => setIsAdding(false),
        onError: () => setIsAdding(false),
      }
    );
  };

  return (
    <Button onClick={handleAdd} loading={isAdding}>
      Add to Cart
    </Button>
  );
}
```

**Methods:**
- `optimisticAddToCart(product, size, quantity, options)` - Add item optimistically
- `optimisticRemoveFromCart(itemId, options)` - Remove item optimistically
- `optimisticUpdateQuantity(itemId, quantity, options)` - Update quantity optimistically

### useOptimisticWishlist Hook

Provides optimistic UI updates for wishlist operations.

```tsx
import { useOptimisticWishlist } from "@/lib/hooks/useOptimisticWishlist";

function WishlistButton({ product }: { product: Product }) {
  const { optimisticToggleWishlist, isInWishlist } = useOptimisticWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleToggle = async () => {
    await optimisticToggleWishlist(product, {
      showToast: true,
      addToastMessage: `${product.name} added to wishlist`,
      removeToastMessage: `${product.name} removed from wishlist`,
    });
  };

  return (
    <Button onClick={handleToggle}>
      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}
```

**Methods:**
- `optimisticToggleWishlist(product, options)` - Toggle wishlist optimistically
- `optimisticAddToWishlist(product, options)` - Add to wishlist optimistically
- `optimisticRemoveFromWishlist(productId, options)` - Remove from wishlist optimistically
- `isInWishlist(productId)` - Check if product is in wishlist

---

## Toast Notifications

Toast system is already integrated via `ToastProvider` in `app/layout.tsx`.

### Using Toasts

```tsx
import { useToast } from "@/components/ui/Toast";

function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast({
      type: "success",
      title: "Success",
      message: "Item added to cart",
      duration: 3000, // Optional, default: 3000ms
    });
  };

  const handleError = () => {
    addToast({
      type: "error",
      title: "Error",
      message: "Something went wrong",
      duration: 5000,
    });
  };

  const handleInfo = () => {
    addToast({
      type: "info",
      title: "Info",
      message: "Saved for later",
    });
  };
}
```

**Toast Types:**
- `"success"` - Green, checkmark icon
- `"error"` - Red, alert icon
- `"warning"` - Yellow, warning icon
- `"info"` - Blue, info icon

**Props:**
- `type: ToastType` - Toast type
- `title: string` - Toast title
- `message?: string` - Toast message
- `duration?: number` - Auto-dismiss duration in ms (default: 3000)

---

## Integration Examples

### Example 1: Product Grid with Loading and Error States

```tsx
"use client";

import { Suspense } from "react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/ProductGridSkeleton";
import { ProductErrorBoundary } from "@/components/errors/ProductErrorBoundary";
import { NetworkError } from "@/components/errors/NetworkError";

export function ProductGridWithStates() {
  const [products, setProducts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  if (error) {
    return (
      <NetworkError
        message="Unable to load products"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <ProductErrorBoundary onRetry={() => window.location.reload()}>
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <ProductGrid products={products} isLoading={isLoading} columns={4} />
      </Suspense>
    </ProductErrorBoundary>
  );
}
```

### Example 2: Form Submission with Loading and Toast

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit");

      addToast({
        type: "success",
        title: "Success",
        message: "Your message has been sent!",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button
        type="submit"
        loading={isSubmitting}
        loadingText="Sending..."
        disabled={isSubmitting}
      >
        Send Message
      </Button>
    </form>
  );
}
```

### Example 3: Optimistic Cart with Error Handling

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useOptimisticCart } from "@/lib/hooks/useOptimisticCart";
import { useToast } from "@/components/ui/Toast";

export function AddToCartButton({ product, size }: Props) {
  const [isAdding, setIsAdding] = React.useState(false);
  const { optimisticAddToCart } = useOptimisticCart();
  const { addToast } = useToast();

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await optimisticAddToCart(product, size, 1, {
        showToast: true,
        toastMessage: `${product.name} added to cart`,
        onSuccess: () => {
          setIsAdding(false);
        },
        onError: (error) => {
          setIsAdding(false);
          console.error("Failed to add to cart:", error);
        },
      });
    } catch (error) {
      setIsAdding(false);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to add to cart. Please try again.",
      });
    }
  };

  return (
    <Button
      onClick={handleAdd}
      loading={isAdding}
      disabled={isAdding || !product.inStock}
    >
      Add to Cart
    </Button>
  );
}
```

---

## Best Practices

1. **Always show loading states** - Users should know something is happening
2. **Use optimistic UI** - Update UI immediately, rollback on error
3. **Handle errors gracefully** - Show user-friendly messages, provide retry options
4. **Use toast notifications** - For success/error feedback that doesn't require blocking UI
5. **Wrap error-prone components** - Use error boundaries for critical sections
6. **Test error scenarios** - Test network failures, API errors, invalid data

---

## File Locations

- Loading Components: `components/ui/ProductGridSkeleton.tsx`, `LoadingSpinner.tsx`, `PageLoadingBar.tsx`, `ImagePlaceholder.tsx`
- Error Boundaries: `components/errors/ProductErrorBoundary.tsx`, `NetworkError.tsx`
- Optimistic Hooks: `lib/hooks/useOptimisticCart.ts`, `useOptimisticWishlist.ts`
- Toast System: `components/ui/Toast.tsx`
- Examples: `components/examples/LoadingStatesExample.tsx`
