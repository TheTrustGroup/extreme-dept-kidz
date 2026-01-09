"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { ShoppingBag, Edit3, ArrowLeft } from "lucide-react";
import type { StyleLook } from "@/types/styling";
import { calculateBundleDiscount, getProductById } from "@/lib/utils/styling-utils";
import { useStylingStore } from "@/lib/stores/styling-store";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { Button } from "@/components/ui/button";
import { H1, H2 } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { formatPrice } from "@/lib/utils";
import { CompleteTheLookSizeModal } from "@/components/product/CompleteTheLookSizeModal";
import { CustomizeLookModal } from "@/components/product/CustomizeLookModal";
import { useToast } from "@/components/ui/Toast";

interface LookDetailClientProps {
  look: StyleLook;
}

/**
 * Look Detail Client Component
 * 
 * Detailed view of a complete look with all products and styling notes.
 */
export function LookDetailClient({ look }: LookDetailClientProps): JSX.Element {
  const [isSizeModalOpen, setIsSizeModalOpen] = React.useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = React.useState(false);
  const { open: openCart } = useCartDrawer();
  const { showToast } = useToast();
  const { setCurrentLook, addCompleteLookToCart } = useStylingStore();

  const lookProducts = React.useMemo(() => {
    return look.products
      .map(({ productId }) => getProductById(productId))
      .filter(p => p !== undefined);
  }, [look]);

  const pricing = React.useMemo(() => {
    return calculateBundleDiscount(lookProducts, look);
  }, [lookProducts, look]);

  const requiredProducts = look.products.filter(p => !p.isOptional);

  const handleAddCompleteLook = (): void => {
    setCurrentLook(look);
    setIsSizeModalOpen(true);
  };

  const handleCustomize = (): void => {
    setCurrentLook(look);
    setIsCustomizeModalOpen(true);
  };

  const handleSizeModalConfirm = (sizes: Record<string, string>): void => {
    const result = addCompleteLookToCart(look, sizes);
    setIsSizeModalOpen(false);
    
    if (result.success) {
      showToast(
        `${look.name} added! ${result.count} items added to your cart`,
        "success"
      );
      
      setTimeout(() => {
        openCart();
      }, 1000);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Style Guide", href: "/style-guide" },
    { label: look.name },
  ];

  return (
    <>
      <div className="min-h-screen bg-cream-50 pt-20 md:pt-24 pb-16">
        <Container size="lg">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Back Link */}
          <Link
            href="/style-guide"
            className="inline-flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Style Guide</span>
          </Link>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 mb-16">
            {/* Look Image */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-cream-100">
                <Image
                  src={look.mainImage}
                  alt={look.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                {look.bundleDiscount && (
                  <div className="absolute top-4 right-4 bg-green-500 text-cream-50 text-sm font-bold px-4 py-2 rounded-full">
                    SAVE {look.bundleDiscount}%
                  </div>
                )}
              </div>
            </div>

            {/* Look Info */}
            <div className="space-y-6">
              <div>
                <H1 className="text-charcoal-900 text-3xl md:text-4xl font-serif font-bold mb-4">
                  {look.name}
                </H1>
                <p className="text-charcoal-600 text-base md:text-lg mb-6">
                  {look.description}
                </p>
              </div>

              {/* Look Details */}
              <div className="space-y-2 text-sm text-charcoal-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Pieces:</span>
                  <span>{requiredProducts.length}</span>
                </div>
                {look.ageRange && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Age:</span>
                    <span>{look.ageRange}</span>
                  </div>
                )}
                {look.occasion && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Occasion:</span>
                    <span>{look.occasion}</span>
                  </div>
                )}
                {look.season && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Season:</span>
                    <span className="capitalize">{look.season}</span>
                  </div>
                )}
              </div>

              {/* Pricing */}
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
                  <span className="text-navy-900 font-serif text-2xl font-bold">
                    {formatPrice(pricing.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={handleAddCompleteLook}
                >
                  <ShoppingBag className="w-5 h-5" />
                  ADD COMPLETE LOOK
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={handleCustomize}
                >
                  <Edit3 className="w-5 h-5" />
                  Customize
                </Button>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-16">
            <H2 className="text-charcoal-900 text-2xl md:text-3xl font-serif font-bold mb-8">
              WHAT&apos;S INCLUDED
            </H2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lookProducts.map((product, index) => {
                const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

                return (
                  <m.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex gap-4 p-4 border border-cream-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative w-24 h-32 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0"
                    >
                      <Image
                        src={primaryImage.url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${product.slug}`}
                        className="block"
                      >
                        <h3 className="font-sans text-base font-semibold text-charcoal-900 mb-1">
                          {product.name}
                        </h3>
                        <p className="font-sans text-sm text-charcoal-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <p className="font-sans text-base font-semibold text-charcoal-900 mb-3">
                          {formatPrice(product.price)}
                        </p>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={`/products/${product.slug}`}>
                          View Product
                        </Link>
                      </Button>
                    </div>
                  </m.div>
                );
              })}
            </div>
          </div>

          {/* Styling Notes */}
          <div className="bg-cream-100 rounded-xl p-6 md:p-8">
            <H2 className="text-charcoal-900 text-xl md:text-2xl font-serif font-bold mb-4">
              STYLING NOTES
            </H2>
            <p className="text-charcoal-600 text-base leading-relaxed">
              This versatile look transitions seamlessly from playground to pizza night. 
              Layer the outerwear over the base layer for cooler weather, or wear pieces 
              individually when it&apos;s warm. Each piece is designed to work together 
              while maintaining its own style identity.
            </p>
          </div>
        </Container>
      </div>

      {/* Size Selection Modal */}
      <CompleteTheLookSizeModal
        look={look}
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        onConfirm={handleSizeModalConfirm}
      />

      {/* Customize Modal */}
      <CustomizeLookModal
        look={look}
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />
    </>
  );
}
