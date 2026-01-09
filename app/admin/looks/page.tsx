"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Plus, Sparkles, Edit, Trash2 } from "lucide-react";
import { getLooks } from "@/lib/admin-api";
import { calculateBundleDiscount, getProductById } from "@/lib/utils/styling-utils";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";
import type { StyleLook } from "@/types/styling";

/**
 * Complete Looks Management Page
 * 
 * Manage all curated complete looks.
 */
export default function LooksPage(): JSX.Element {
  const [looks, setLooks] = React.useState<StyleLook[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadLooks(): Promise<void> {
      setLoading(true);
      try {
        const data = await getLooks();
        setLooks(data);
      } catch (error) {
        console.error("Failed to load looks:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLooks();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <H1 className="text-charcoal-900 text-3xl font-serif font-bold">Complete Looks</H1>
        <Button variant="primary" asChild>
          <Link href="/admin/looks/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Look
          </Link>
        </Button>
      </div>

      {/* Looks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : looks.length === 0 ? (
        <div className="bg-cream-50 rounded-xl border border-cream-200 p-12 text-center">
          <Sparkles className="w-12 h-12 text-charcoal-400 mx-auto mb-4" />
          <p className="text-charcoal-600 mb-4">No complete looks yet</p>
          <Button variant="primary" asChild>
            <Link href="/admin/looks/new">Create Your First Look</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {looks.map((look) => {
            const lookProducts = look.products
              .map((p) => getProductById(p.productId))
              .filter((p): p is Product => p !== undefined);
            const pricing = calculateBundleDiscount(lookProducts, look);

            return (
              <m.div
                key={look.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cream-50 rounded-xl border border-cream-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[3/4] bg-cream-100">
                  <Image
                    src={look.mainImage}
                    alt={look.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {look.bundleDiscount && (
                    <div className="absolute top-4 left-4 bg-green-500 text-cream-50 text-xs font-bold px-3 py-1 rounded-full">
                      SAVE {look.bundleDiscount}%
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">{look.name}</h3>
                  <p className="text-sm text-charcoal-600 mb-3 line-clamp-2">{look.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-charcoal-600">
                      {look.products.length} pieces • Age {look.ageRange}
                    </span>
                    <span className="font-serif text-lg font-bold text-navy-900">
                      {formatPrice(pricing.total)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" asChild className="flex-1">
                      <Link href={`/admin/looks/${look.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </m.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Add missing import
import type { Product } from "@/types";
