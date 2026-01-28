"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { styleLooks } from "@/lib/mock-data/styling-data";
import { completeLooks } from "@/lib/mock-data";
import type { CompleteLook } from "@/types";
import { calculateBundleDiscount, getProductById } from "@/lib/utils/styling-utils";
import { Button } from "@/components/ui/button";
import { H2, H3, Body, Caption } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/utils";
import { getImageBlurDataURL } from "@/lib/utils/image-utils";

/**
 * StyleGuideSection Component
 * 
 * Homepage section showcasing featured complete looks.
 */
export function StyleGuideSection(): JSX.Element {
  // Get featured looks (combine styleLooks and completeLooks)
  const featuredLooks = React.useMemo(() => {
    // Convert completeLooks to StyleLook format for homepage
    const convertedCompleteLooks = completeLooks
      .filter((look: CompleteLook) => look.featured)
      .map((look: CompleteLook) => {
        // Determine category based on product types
        const getCategory = (product: any): "top" | "bottom" | "outerwear" | "shoes" | "accessories" => {
          const catSlug = product.category?.slug || '';
          if (catSlug.includes('shirt') || catSlug.includes('top')) return 'top';
          if (catSlug.includes('trouser') || catSlug.includes('pant') || catSlug.includes('bottom')) return 'bottom';
          if (catSlug.includes('shoe') || catSlug.includes('loafer')) return 'shoes';
          if (catSlug.includes('accessor')) return 'accessories';
          return 'top'; // default
        };

        return {
          id: look.id,
          name: look.name,
          description: look.description,
          mainImage: look.mainImage,
          products: look.items.map(item => ({
            productId: item.product.id,
            category: getCategory(item.product),
            isOptional: !item.required,
          })),
          totalPrice: look.bundlePrice,
          bundleDiscount: look.savings > 0 ? Math.round((look.savings / look.totalPrice) * 100) : undefined,
          occasion: look.tags.find(t => ['casual', 'formal', 'smart-casual'].includes(t.toLowerCase())),
          ageRange: 'boys',
          season: 'all-season' as const,
          featured: look.featured,
          createdAt: new Date(look.createdAt || Date.now()),
        } as typeof styleLooks[0];
      });
    
    // Combine and get featured looks
    const allFeatured = [...styleLooks.filter(look => look.featured), ...convertedCompleteLooks];
    return allFeatured.slice(0, 3);
  }, []);

  if (featuredLooks.length === 0) {
    return <></>;
  }

  return (
    <section 
      className="section reveal bg-cream-50 [data-theme='dark']:bg-dark-bg-primary"
      aria-labelledby="style-guide-heading"
    >
      <Container size="lg">
        {/* Design System: Large spacing between header and content - 32px mobile, 48px desktop */}
        <div className="space-y-8 lg:space-y-12">
          {/* Section Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-3 sm:space-y-4"
          >
            <H2 
              id="style-guide-heading"
              className="text-charcoal-900"
            >
              STYLE GUIDE
            </H2>
            <Body className="text-charcoal-600 max-w-2xl mx-auto">
              Curated looks for effortless style
            </Body>
          </m.div>

          {/* Looks Grid */}
          <div 
            // Design System: Grid gaps - 24px mobile, 32px tablet, 32px desktop
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-8"
            role="list"
            aria-label="Featured style guide looks"
          >
            {featuredLooks.map((look, index) => {
              const lookProducts = look.products
                .map(({ productId }) => getProductById(productId))
                .filter(p => p !== undefined);
              
              const pricing = calculateBundleDiscount(lookProducts, look);
              const requiredProducts = look.products.filter(p => !p.isOptional);

              return (
                <m.div
                  key={look.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                  role="listitem"
                >
                  <Link 
                    href={completeLooks.some(cl => cl.id === look.id) ? `/looks/${look.id}` : `/style-guide/${look.id}`} 
                    className="block focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:rounded-xl"
                    aria-label={`View ${look.name} style guide look`}
                  >
                    <div className="bg-cream-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-normal">
                      {/* Look Image */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={look.mainImage}
                          alt={`${look.name} - ${look.description || 'Complete look'}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={85}
                          placeholder="blur"
                          blurDataURL={getImageBlurDataURL(600, 800)}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
                        
                        {/* Savings Badge */}
                        {look.bundleDiscount && (
                          <div className="absolute top-4 right-4 bg-green-500 text-cream-50 text-xs font-bold px-3 py-1.5 rounded-full">
                            SAVE {look.bundleDiscount}%
                          </div>
                        )}
                      </div>

                      {/* Look Info */}
                      <div className="p-6 space-y-4">
                        <div>
                          <H3 className="text-charcoal-900 mb-2">
                            {look.name}
                          </H3>
                          <Body className="text-charcoal-600 line-clamp-2 mb-3 text-sm">
                            {look.description}
                          </Body>
                        </div>

                        {/* Product Count & Details */}
                        <Caption className="text-charcoal-500 mb-3 flex items-center gap-2">
                          <span>{requiredProducts.length} pieces</span>
                          {look.ageRange && (
                            <>
                              <span>•</span>
                              <span>Age {look.ageRange}</span>
                            </>
                          )}
                          {look.occasion && (
                            <>
                              <span>•</span>
                              <span>{look.occasion}</span>
                            </>
                          )}
                        </Caption>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-lg md:text-xl font-bold text-navy-900">
                            {formatPrice(pricing.total)}
                          </span>
                          {pricing.savings > 0 && (
                            <span className="font-sans text-sm text-charcoal-500 line-through">
                              {formatPrice(pricing.subtotal)}
                            </span>
                          )}
                        </div>

                        {/* CTA Button */}
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2 min-h-[44px]"
                          asChild
                        >
                          <span>
                            SHOP LOOK
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  </Link>
                </m.div>
              );
            })}
          </div>

          {/* View All Link */}
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center"
          >
            <Button
              variant="secondary"
              size="lg"
              className="min-h-[44px]"
              asChild
            >
              <Link href="/style-guide" className="flex items-center gap-2" aria-label="View all style guide looks">
                VIEW ALL LOOKS
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </Button>
          </m.div>
        </div>
      </Container>
    </section>
  );
}
