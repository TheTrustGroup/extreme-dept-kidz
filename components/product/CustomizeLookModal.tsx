"use client";

import * as React from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { X, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { StyleLook } from "@/types/styling";
import { getProductById, calculateBundleDiscount } from "@/lib/utils/styling-utils";
import { productStylingData } from "@/lib/mock-data/styling-data";
import { useStylingStore } from "@/lib/stores/styling-store";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { cn, formatPrice } from "@/lib/utils";

interface CustomizeLookModalProps {
  look: StyleLook;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CustomizeLookModal Component
 * 
 * Modal for customizing a complete look by swapping items.
 */
export function CustomizeLookModal({
  look,
  isOpen,
  onClose,
}: CustomizeLookModalProps): JSX.Element {
  const { customizedProducts, customizeProduct, resetCustomization } = useStylingStore();
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());

  // Get all products in the look
  const lookProducts = React.useMemo(() => {
    return look.products
      .map(({ productId, category }) => {
        const finalProductId = customizedProducts[category] || productId;
        return {
          productId: finalProductId,
          originalProductId: productId,
          category,
          product: getProductById(finalProductId),
        };
      })
      .filter(p => p.product !== undefined);
  }, [look, customizedProducts]);

  // Calculate pricing with customized products
  const pricing = React.useMemo(() => {
    const products = lookProducts.map(p => p.product).filter((p): p is NonNullable<typeof p> => p !== undefined);
    return calculateBundleDiscount(products, look);
  }, [lookProducts, look]);

  const toggleCategory = (category: string): void => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleSwap = (category: string, productId: string): void => {
    customizeProduct(category, productId);
  };

  const handleReset = (): void => {
    resetCustomization();
  };

  const getAlternatives = (category: string): Array<{ productId: string; product: ReturnType<typeof getProductById> }> => {
    const styling = productStylingData[look.products[0]?.productId || ""];
    if (!styling) return [];

    const lookData = styling.completeTheLook.find(l => l.lookId === look.id);
    if (!lookData?.alternativeProducts) return [];

    const categoryAlternatives = lookData.alternativeProducts.find(a => a.category === category);
    if (!categoryAlternatives) return [];

    return categoryAlternatives.productIds
      .map(productId => ({
        productId,
        product: getProductById(productId),
      }))
      .filter((p): p is { productId: string; product: NonNullable<ReturnType<typeof getProductById>> } => p.product !== undefined);
  };

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
              className="bg-cream-50 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="customize-modal-title"
            >
              {/* Header */}
              <div className="sticky top-0 bg-cream-50 border-b border-cream-200 px-6 py-4 flex items-center justify-between z-10">
                <H3 id="customize-modal-title" className="text-charcoal-900 font-serif text-xl md:text-2xl font-bold">
                  Customize Your Look
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
                <div className="text-center">
                  <h4 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
                    {look.name}
                  </h4>
                  <p className="text-sm text-charcoal-600">
                    {look.description}
                  </p>
                </div>

                {/* Products by Category */}
                {["outerwear", "top", "bottom", "shoes", "accessories"].map((category) => {
                  const productInCategory = lookProducts.find(p => p.category === category);
                  if (!productInCategory || !productInCategory.product) return null;

                  const isExpanded = expandedCategories.has(category);
                  const alternatives = getAlternatives(category);
                  const isCustomized = customizedProducts[category] && 
                    customizedProducts[category] !== productInCategory.originalProductId;
                  const primaryImage = productInCategory.product.images.find(img => img.isPrimary) || 
                    productInCategory.product.images[0];

                  return (
                    <div
                      key={category}
                      className="border border-cream-200 rounded-lg overflow-hidden"
                    >
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full px-4 py-3 bg-cream-100 flex items-center justify-between hover:bg-cream-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-sans text-sm font-semibold text-charcoal-900 uppercase tracking-wide">
                            {category}
                          </span>
                          {isCustomized && (
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              Customized
                            </span>
                          )}
                        </div>
                        {alternatives.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-charcoal-600">
                              {alternatives.length} alternatives
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-charcoal-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-charcoal-600" />
                            )}
                          </div>
                        )}
                      </button>

                      {/* Current Product */}
                      <div className="p-4 flex items-center gap-4">
                        <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                          <Image
                            src={primaryImage.url}
                            alt={productInCategory.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold text-charcoal-900 mb-1">
                            {productInCategory.product.name}
                          </p>
                          <p className="font-sans text-sm text-charcoal-600">
                            {formatPrice(productInCategory.product.price)}
                          </p>
                        </div>
                        {isCustomized && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                      </div>

                      {/* Alternatives */}
                      {isExpanded && alternatives.length > 0 && (
                        <m.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-cream-200 p-4 space-y-3"
                        >
                          <p className="text-xs font-semibold text-charcoal-600 uppercase tracking-wide mb-2">
                            Alternatives
                          </p>
                          {alternatives.map(({ productId, product }) => {
                            if (!product) return null;
                            const altPrimaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                            const isSelected = customizedProducts[category] === productId;

                            return (
                              <button
                                key={productId}
                                onClick={() => handleSwap(category, productId)}
                                className={cn(
                                  "w-full p-3 rounded-lg border-2 transition-all duration-200 text-left",
                                  isSelected
                                    ? "border-navy-900 bg-navy-50"
                                    : "border-cream-200 hover:border-navy-500 hover:bg-cream-50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-16 rounded overflow-hidden bg-cream-100 flex-shrink-0">
                                    <Image
                                      src={altPrimaryImage.url}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-sans text-sm font-medium text-charcoal-900 mb-1">
                                      {product.name}
                                    </p>
                                    <p className="font-sans text-xs text-charcoal-600">
                                      {formatPrice(product.price)}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-5 h-5 text-navy-900" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </m.div>
                      )}
                    </div>
                  );
                })}

                {/* Pricing Summary */}
                <div className="bg-cream-100 rounded-lg p-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-600">Subtotal:</span>
                    <span className="text-charcoal-900 font-semibold line-through">
                      {formatPrice(pricing.subtotal)}
                    </span>
                  </div>
                  {pricing.savings > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-medium">Bundle Discount ({look.bundleDiscount}%):</span>
                      <span className="text-green-600 font-semibold">
                        -{formatPrice(pricing.savings)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-cream-200 pt-3 flex items-center justify-between">
                    <span className="text-charcoal-900 font-serif text-lg font-bold">Total:</span>
                    <span className="text-navy-900 font-serif text-xl font-bold">
                      {formatPrice(pricing.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-cream-50 border-t border-cream-200 px-6 py-4 flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  disabled={Object.keys(customizedProducts).length === 0}
                >
                  Reset
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      // This will be handled by the parent component
                      onClose();
                    }}
                  >
                    Continue to Size Selection
                  </Button>
                </div>
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
