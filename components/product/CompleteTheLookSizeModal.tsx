"use client";

import * as React from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import type { StyleLook } from "@/types/styling";
import { getProductById, recommendSizesForLook } from "@/lib/utils/styling-utils";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { cn, formatPrice } from "@/lib/utils";

interface CompleteTheLookSizeModalProps {
  look: StyleLook;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sizes: Record<string, string>) => void;
}

/**
 * CompleteTheLookSizeModal Component
 * 
 * Modal for selecting sizes for all products in a complete look.
 */
export function CompleteTheLookSizeModal({
  look,
  isOpen,
  onClose,
  onConfirm,
}: CompleteTheLookSizeModalProps): JSX.Element {
  const [selectedSizes, setSelectedSizes] = React.useState<Record<string, string>>({});
  const [recommendations] = React.useState<Record<string, string>>(() => {
    const productsToProcess = look.products || look.items || [];
    const products = productsToProcess
      .map((item: any) => {
        const productId = item.productId || item.product?.id;
        return item.product || getProductById(productId);
      })
      .filter((p): p is any => p !== undefined);
    return recommendSizesForLook(products);
  });

  // Get all products in the look (handle both API and mock formats)
  const lookProducts = React.useMemo(() => {
    const productsToProcess = look.products || look.items || [];
    return productsToProcess
      .map((item: any) => {
        const productId = item.productId || item.product?.id;
        return item.product || getProductById(productId);
      })
      .filter((p): p is any => p !== undefined);
  }, [look]);

  // Initialize selected sizes with recommendations
  React.useEffect(() => {
    if (isOpen && Object.keys(selectedSizes).length === 0) {
      setSelectedSizes(recommendations);
    }
  }, [isOpen, recommendations, selectedSizes]);

  const handleSizeSelect = (productId: string, size: string): void => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleConfirm = (): void => {
    // Validate all required products have sizes
    const productsToCheck = look.products || look.items || [];
    const requiredProducts = productsToCheck.filter((p: any) => p.required !== false && p.isRequired !== false);
    const allSizesSelected = requiredProducts.every(
      (item: any) => {
        const productId = item.productId || item.product?.id;
        return selectedSizes[productId];
      }
    );

    if (allSizesSelected) {
      onConfirm(selectedSizes);
    }
  };

  const allSizesSelected = React.useMemo(() => {
    const productsToCheck = look.products || look.items || [];
    const requiredProducts = productsToCheck.filter((p: any) => p.required !== false && p.isRequired !== false);
    return requiredProducts.every(
      (item: any) => {
        const productId = item.productId || item.product?.id;
        return selectedSizes[productId];
      }
    );
  }, [look, selectedSizes]);

  if (!isOpen) return <></>;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-cream-50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="size-modal-title"
            >
              {/* Header */}
              <div className="sticky top-0 bg-cream-50 border-b border-cream-200 px-6 py-4 flex items-center justify-between z-10">
                <H3 id="size-modal-title" className="text-charcoal-900 font-serif text-xl md:text-2xl font-bold">
                  Select Sizes for Complete Look
                </H3>
                <button
                  onClick={onClose}
                  className="p-2 text-charcoal-600 hover:text-charcoal-900 transition-colors rounded-lg hover:bg-cream-200"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Smart Size Recommendation */}
                <div className="bg-navy-50 border border-navy-200 rounded-lg p-4 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-navy-900 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-navy-900 font-medium mb-1">
                      Smart size pre-selected
                    </p>
                    <p className="text-xs text-navy-700">
                      Sizes have been pre-selected based on typical fit. You can adjust them below.
                    </p>
                  </div>
                </div>

                {/* Product Size Selectors */}
              {lookProducts.map((product, index) => {
                const productsToCheck = look.products || look.items || [];
                const productInLook = productsToCheck.find((p: any) => {
                  const pId = p.productId || p.product?.id;
                  return pId === product.id;
                });
                const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
                // Handle both sizes array and variants array
                const availableSizes = (product.sizes?.filter((s: any) => s.inStock) || 
                                         product.variants?.filter((v: any) => v.stock > 0).map((v: any) => ({ size: v.size, inStock: true })) || []);
                const selectedSize = selectedSizes[product.id];

                  return (
                    <m.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border border-cream-200 rounded-lg p-4"
                  >
                    <div className="flex gap-4 mb-4">
                      {primaryImage && (
                        <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                          <Image
                            src={primaryImage.url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sans text-base font-semibold text-charcoal-900 mb-1">
                          {product.name}
                        </h4>
                        <p className="font-sans text-sm text-charcoal-600 mb-2">
                          {formatPrice(product.price)}
                        </p>
                        {(productInLook?.isOptional === true || productInLook?.required === false || productInLook?.isRequired === false) && (
                          <span className="inline-block text-xs text-charcoal-500 bg-cream-200 px-2 py-1 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                    </div>

                      <div>
                        <p className="font-sans text-sm font-medium text-charcoal-700 mb-2">
                          Size: {selectedSize && <span className="text-navy-900 font-semibold">{selectedSize}</span>}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.length > 0 ? (
                            availableSizes.map((size: any) => {
                              const sizeValue = size.size || size;
                              return (
                                <button
                                  key={sizeValue}
                                  onClick={() => handleSizeSelect(product.id, sizeValue)}
                                  className={cn(
                                    "px-4 py-2 rounded-lg border-2 transition-all duration-200 font-sans text-sm font-medium",
                                    selectedSize === sizeValue
                                      ? "bg-navy-900 text-cream-50 border-navy-900"
                                      : "bg-cream-50 text-charcoal-700 border-cream-300 hover:border-navy-500 hover:text-navy-900"
                                  )}
                                >
                                  {sizeValue}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-sm text-charcoal-500">No sizes available</p>
                          )}
                        </div>
                      </div>
                    </m.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-cream-50 border-t border-cream-200 px-6 py-4 flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={!allSizesSelected}
                  className="flex items-center gap-2"
                >
                  ADD COMPLETE LOOK TO CART
                  {(look.bundleDiscount || (look.bundlePrice && look.totalPrice && look.totalPrice > look.bundlePrice)) && (
                    <span className="text-xs opacity-90">
                      (Save {look.bundleDiscount || (look.totalPrice && look.bundlePrice ? Math.round(((look.totalPrice - look.bundlePrice) / look.totalPrice) * 100) : 0)}%)
                    </span>
                  )}
                </Button>
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
