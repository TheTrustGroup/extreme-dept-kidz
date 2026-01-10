"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Sparkles, ShoppingBag, Edit3 } from "lucide-react";
import type { Product } from "@/types";
import { getCompleteLooksForProduct, getProductById, calculateBundleDiscount } from "@/lib/utils/styling-utils";
import { useStylingStore } from "@/lib/stores/styling-store";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { Button } from "@/components/ui/button";
import { H2 } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";
import { cn, formatPrice } from "@/lib/utils";
import { CompleteTheLookSizeModal } from "./CompleteTheLookSizeModal";
import { CustomizeLookModal } from "./CustomizeLookModal";
import { useToast } from "@/components/ui/Toast";

interface CompleteTheLookProps {
  currentProduct: Product;
}

/**
 * CompleteTheLook Component
 * 
 * Premium "Complete The Look" section showing curated outfit combinations.
 * Appears on product detail pages below product info.
 */
export function CompleteTheLook({ currentProduct }: CompleteTheLookProps): JSX.Element | null {
  const [selectedLookIndex, setSelectedLookIndex] = React.useState(0);
  const [isSizeModalOpen, setIsSizeModalOpen] = React.useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = React.useState(false);
  const { open: openCart } = useCartDrawer();
  const { showToast } = useToast();
  const { setCurrentLook, addCompleteLookToCart } = useStylingStore();

  // Get complete looks for this product (hooks must be called before early return)
  const looks = React.useMemo(
    () => getCompleteLooksForProduct(currentProduct.id),
    [currentProduct.id]
  );

  // Get selected look (hooks must be called before early return)
  const selectedLook = React.useMemo(() => {
    return looks[selectedLookIndex] || null;
  }, [looks, selectedLookIndex]);

  // Get all products in the look (hooks must be called before early return)
  const lookProducts = React.useMemo(() => {
    if (!selectedLook) return [];
    return selectedLook.products
      .map(({ productId }) => getProductById(productId))
      .filter((p): p is Product => p !== undefined);
  }, [selectedLook]);

  // Calculate pricing (hooks must be called before early return)
  const pricing = React.useMemo(() => {
    if (!selectedLook || lookProducts.length === 0) {
      return { subtotal: 0, discount: 0, total: 0, savings: 0 };
    }
    return calculateBundleDiscount(lookProducts, selectedLook);
  }, [lookProducts, selectedLook]);

  // If no looks available, don't render
  if (!looks || looks.length === 0 || !selectedLook) {
    return null;
  }

  const handleAddCompleteLook = (): void => {
    setCurrentLook(selectedLook);
    setIsSizeModalOpen(true);
  };

  const handleCustomize = (): void => {
    setCurrentLook(selectedLook);
    setIsCustomizeModalOpen(true);
  };

  const handleSizeModalConfirm = (sizes: Record<string, string>): void => {
    const result = addCompleteLookToCart(selectedLook, sizes);
    setIsSizeModalOpen(false);
    
    if (result.success) {
      showToast({
        type: "success",
        title: "Added to cart",
        message: `${selectedLook.name} added! ${result.count} items added to your cart`,
      });
      
      // Open cart drawer after a short delay
      setTimeout(() => {
        openCart();
      }, 1000);
    }
  };

  return (
    <>
      <section className="py-12 md:py-16 lg:py-20 bg-cream-50 border-t border-cream-200">
        <Container size="lg">
          <div className="space-y-8 md:space-y-10">
            {/* Section Header */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-2"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-navy-900" />
                <H2 className="text-charcoal-900 text-2xl md:text-3xl lg:text-4xl font-serif font-bold">
                  COMPLETE THE LOOK
                </H2>
              </div>
              <p className="text-charcoal-600 text-sm md:text-base">
                Style it effortlessly. Curated by our team.
              </p>
            </m.div>

            {/* Look Preview */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative rounded-xl overflow-hidden bg-cream-100 aspect-[3/2] md:aspect-[16/10]"
            >
              <Image
                src={selectedLook.mainImage}
                alt={selectedLook.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent" />
              
              {/* Look Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-cream-50 mb-1">
                      {selectedLook.name}
                    </h3>
                    {selectedLook.bundleDiscount && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-cream-50 text-xs font-semibold">
                        SAVE {selectedLook.bundleDiscount}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </m.div>

            {/* Look Description */}
            <m.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center text-charcoal-600 text-sm md:text-base max-w-2xl mx-auto"
            >
              {selectedLook.description}
            </m.p>

            {/* Products Grid */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
            >
              {lookProducts.map((product, index) => {
                const isCurrentProduct = product.id === currentProduct.id;
                const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                
                return (
                  <m.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    className={cn(
                      "relative group",
                      isCurrentProduct && "ring-2 ring-navy-900 rounded-lg p-1"
                    )}
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="block"
                    >
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cream-100 mb-2">
                        <Image
                          src={primaryImage.url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {isCurrentProduct && (
                          <div className="absolute top-2 left-2 bg-navy-900 text-cream-50 text-xs font-semibold px-2 py-1 rounded">
                            You&apos;re viewing
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-sans text-xs md:text-sm text-charcoal-900 font-medium mb-1 line-clamp-2">
                          {product.name}
                        </p>
                        <p className="font-sans text-sm md:text-base text-charcoal-700 font-semibold">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  </m.div>
                );
              })}
            </m.div>

            {/* Pricing Breakdown */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-cream-100 rounded-lg p-6 md:p-8 space-y-4"
            >
              <div className="flex items-center justify-between text-sm md:text-base">
                <span className="text-charcoal-600">Subtotal:</span>
                <span className="text-charcoal-900 font-semibold line-through">
                  {formatPrice(pricing.subtotal)}
                </span>
              </div>
              {pricing.savings > 0 && (
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-green-600 font-medium">Bundle Discount ({selectedLook.bundleDiscount}%):</span>
                  <span className="text-green-600 font-semibold">
                    -{formatPrice(pricing.savings)}
                  </span>
                </div>
              )}
              <div className="border-t border-cream-200 pt-4 flex items-center justify-between">
                <span className="text-charcoal-900 font-serif text-lg md:text-xl font-bold">Total:</span>
                <span className="text-navy-900 font-serif text-xl md:text-2xl font-bold">
                  {formatPrice(pricing.total)}
                </span>
              </div>
            </m.div>

            {/* Action Buttons */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                variant="primary"
                size="lg"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleAddCompleteLook}
              >
                <ShoppingBag className="w-5 h-5" />
                ADD COMPLETE LOOK TO CART
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleCustomize}
              >
                <Edit3 className="w-5 h-5" />
                Customize This Look
              </Button>
            </m.div>

            {/* Multiple Looks Indicator */}
            {looks.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                {looks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedLookIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === selectedLookIndex
                        ? "bg-navy-900 w-8"
                        : "bg-cream-300 hover:bg-cream-400"
                    )}
                    aria-label={`View look ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Size Selection Modal */}
      <CompleteTheLookSizeModal
        look={selectedLook}
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        onConfirm={handleSizeModalConfirm}
      />

      {/* Customize Modal */}
      <CustomizeLookModal
        look={selectedLook}
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />
    </>
  );
}
