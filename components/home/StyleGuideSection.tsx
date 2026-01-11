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
import { H2 } from "@/components/ui/typography";
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
      .map((look: CompleteLook) => ({
        id: look.id,
        name: look.name,
        description: look.description,
        mainImage: look.mainImage,
        products: look.items.map(item => ({
          productId: item.product.id,
          category: item.product.category.slug as any,
          isOptional: !item.required,
        })),
        totalPrice: look.bundlePrice,
        bundleDiscount: look.savings > 0 ? Math.round((look.savings / look.totalPrice) * 100) : undefined,
        occasion: look.tags.find(t => ['casual', 'formal', 'smart-casual'].includes(t.toLowerCase())),
        ageRange: 'boys',
        season: 'all' as const,
        featured: look.featured,
        createdAt: new Date(look.createdAt || Date.now()),
      }));
    
    // Combine and get featured looks
    const allFeatured = [...styleLooks.filter(look => look.featured), ...convertedCompleteLooks];
    return allFeatured.slice(0, 3);
  }, []);

  if (featuredLooks.length === 0) {
    return <></>;
  }

  return (
    <section className="py-12 xs:py-14 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-cream-50">
      <Container size="lg">
        <div className="space-y-8 xs:space-y-10 sm:space-y-12 md:space-y-14 lg:space-y-16">
          {/* Section Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-3"
          >
            <H2 className="text-charcoal-900 text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-serif font-bold">
              STYLE GUIDE
            </H2>
            <p className="text-charcoal-600 text-sm md:text-base max-w-2xl mx-auto">
              Curated looks for effortless style
            </p>
          </m.div>

          {/* Looks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
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
                >
                  <Link 
                    href={completeLooks.some(cl => cl.id === look.id) ? `/looks/${look.id}` : `/style-guide/${look.id}`} 
                    className="block"
                  >
                    <div className="bg-cream-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                      {/* Look Image */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image
                          src={look.mainImage}
                          alt={look.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={85}
                          placeholder="blur"
                          blurDataURL={getImageBlurDataURL(600, 800)}
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
                          <h3 className="font-serif text-xl md:text-2xl font-bold text-charcoal-900 mb-2">
                            {look.name}
                          </h3>
                          <p className="font-sans text-sm text-charcoal-600 line-clamp-2 mb-3">
                            {look.description}
                          </p>
                        </div>

                        {/* Product Count & Details */}
                        <div className="flex items-center gap-2 text-xs text-charcoal-500 mb-3">
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
                        </div>

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
                          className="w-full flex items-center justify-center gap-2"
                          asChild
                        >
                          <span>
                            SHOP LOOK
                            <ArrowRight className="w-4 h-4" />
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
              asChild
            >
              <Link href="/style-guide" className="flex items-center gap-2">
                VIEW ALL LOOKS
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </m.div>
        </div>
      </Container>
    </section>
  );
}
