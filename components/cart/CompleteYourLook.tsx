"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Sparkles, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { getCartRecommendations, getLooksForCartItems } from "@/lib/utils/styling-utils";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { formatPrice } from "@/lib/utils";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";

/**
 * CompleteYourLook Component
 * 
 * Shows recommendations to complete looks based on cart contents.
 * Appears on cart page between cart items and order summary.
 */
export function CompleteYourLook(): JSX.Element | null {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const { open: openCart } = useCartDrawer();
  const [selectedSize, setSelectedSize] = React.useState<Record<string, string>>({});

  // Get recommendations
  const recommendations = React.useMemo(() => {
    return getCartRecommendations(items);
  }, [items]);

  // Get matching looks
  const matchingLooks = React.useMemo(() => {
    return getLooksForCartItems(items);
  }, [items]);

  // If no recommendations, don't render
  if (recommendations.length === 0) {
    return null;
  }

  const handleAddToCart = (productId: string): void => {
    const product = recommendations.find(p => p.id === productId);
    if (!product) return;

    const size = selectedSize[productId] || product.sizes.find(s => s.inStock)?.size;
    if (!size) return;

    addItem(product, size);
    openCart();
  };

  const handleSizeSelect = (productId: string, size: string): void => {
    setSelectedSize(prev => ({
      ...prev,
      [productId]: size,
    }));
  };

  const matchingLook = matchingLooks[0];

  return (
    <section className="py-8 md:py-12 border-t border-cream-200">
      <div className="space-y-6">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-navy-900" />
          <H3 className="text-charcoal-900 text-xl md:text-2xl font-serif font-bold">
            ✨ COMPLETE YOUR LOOK
          </H3>
        </m.div>

        {matchingLook && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-sm text-charcoal-600"
          >
            You&apos;re almost there! Add these to complete the{" "}
            <span className="font-semibold text-charcoal-900">{matchingLook.name}</span> look.
          </m.p>
        )}

        {/* Recommendations Carousel */}
        <div className="relative">
          {/* Desktop: Grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((product, index) => {
              const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
              const availableSizes = product.sizes.filter(s => s.inStock);
              const productSelectedSize = selectedSize[product.id] || availableSizes[0]?.size;

              return (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="block mb-2"
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cream-100 mb-2">
                      <Image
                        src={primaryImage.url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <p className="font-sans text-sm font-medium text-charcoal-900 mb-1 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="font-sans text-sm text-charcoal-700 font-semibold mb-3">
                      {formatPrice(product.price)}
                    </p>
                  </Link>

                  {/* Size Selector */}
                  {availableSizes.length > 0 && (
                    <div className="mb-3">
                      <select
                        value={productSelectedSize || ""}
                        onChange={(e) => handleSizeSelect(product.id, e.target.value)}
                        className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {availableSizes.map((size) => (
                          <option key={size.size} value={size.size}>
                            Size {size.size}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product.id);
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </m.div>
              );
            })}
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-4">
              {recommendations.slice(0, 4).map((product, index) => {
                const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                const availableSizes = product.sizes.filter(s => s.inStock);
                const productSelectedSize = selectedSize[product.id] || availableSizes[0]?.size;

                return (
                  <m.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="w-[160px] flex-shrink-0"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="block mb-2"
                    >
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cream-100 mb-2">
                        <Image
                          src={primaryImage.url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      </div>
                      <p className="font-sans text-xs font-medium text-charcoal-900 mb-1 line-clamp-2">
                        {product.name}
                      </p>
                      <p className="font-sans text-xs text-charcoal-700 font-semibold mb-2">
                        {formatPrice(product.price)}
                      </p>
                    </Link>

                    {availableSizes.length > 0 && (
                      <select
                        value={productSelectedSize || ""}
                        onChange={(e) => handleSizeSelect(product.id, e.target.value)}
                        className="w-full px-2 py-1.5 border border-cream-300 rounded text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-navy-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {availableSizes.map((size) => (
                          <option key={size.size} value={size.size}>
                            {size.size}
                          </option>
                        ))}
                      </select>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product.id);
                      }}
                    >
                      Add
                    </Button>
                  </m.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
