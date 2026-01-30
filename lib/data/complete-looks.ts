/**
 * Server-only complete looks data.
 * Used by server components (e.g. product page) so no client-side fetch is needed.
 */

import { prisma } from "@/lib/db/prisma";

export interface CompleteLookItem {
  productId: string;
  product: any;
  required: boolean;
  isOptional: boolean;
}

export interface CompleteLookForProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  mainImage: string | null;
  totalPrice: number;
  bundlePrice: number;
  savings: number;
  bundleDiscount: number | null;
  featured: boolean;
  tags: string[];
  ageRange: string | null;
  products: Array<{ productId: string; product: any; required: boolean; isOptional: boolean }>;
  items: Array<{ productId: string; product: any; required: boolean }>;
}

/** Get complete looks (optionally for a product or featured). Server only. */
export async function getCompleteLooksForProduct(
  productId?: string | null,
  featured?: boolean
): Promise<CompleteLookForProduct[]> {
  if (!prisma) return [];

  const where: any = { isActive: true };
  if (productId) {
    where.products = { some: { productId } };
  }
  if (featured) {
    where.featured = true;
  }

  const looks = await prisma.completeLook.findMany({
    where,
    include: {
      products: {
        include: {
          product: {
            include: {
              category: true,
              images: { orderBy: { order: "asc" } },
              variants: {
                select: { id: true, size: true, stock: true, isActive: true },
              },
              tags: { select: { name: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return looks.map((look) => {
    const products = look.products.map((p) => p.product);
    const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
    const bundlePrice = look.bundlePrice;
    const savings = Math.max(0, totalPrice - bundlePrice);
    return {
      id: look.id,
      name: look.name,
      slug: look.slug,
      description: look.description,
      mainImage: look.mainImage,
      totalPrice,
      bundlePrice,
      savings,
      bundleDiscount: look.bundleDiscount,
      featured: look.featured,
      tags: look.tags || [],
      ageRange: look.ageRange,
      products: look.products.map((p) => ({
        productId: p.productId,
        product: p.product,
        required: p.isRequired,
        isOptional: !p.isRequired,
      })),
      items: look.products.map((p) => ({
        productId: p.productId,
        product: p.product,
        required: p.isRequired,
      })),
    };
  });
}
