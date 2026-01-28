import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/fix-product-visibility
 *
 * Ensures Category "boys" and "girls" exist, assigns products to "boys" when
 * they are not in boys/girls, and adds default variants where missing.
 * Use this on production so /collections/boys and /collections/girls show products.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "admin");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Insufficient permissions. Admin role required." },
      { status: 403 }
    );
  }

  if (!prisma) {
    return apiError("Database not available", 500);
  }

  try {
    const boysCategory = await prisma.category.upsert({
      where: { slug: "boys" },
      update: {
        isActive: true,
        name: "Boys",
        description: "Premium streetwear for young legends",
      },
      create: {
        name: "Boys",
        slug: "boys",
        description: "Premium streetwear for young legends",
        isActive: true,
      },
    });

    const girlsCategory = await prisma.category.upsert({
      where: { slug: "girls" },
      update: {
        isActive: true,
        name: "Girls",
        description: "Select premium styles for girls",
      },
      create: {
        name: "Girls",
        slug: "girls",
        description: "Select premium styles for girls",
        isActive: true,
      },
    });

    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
    });

    let assigned = 0;
    let variantsCreated = 0;

    for (const product of products) {
      const slug = product.category?.slug;
      const isBoysOrGirls = slug === "boys" || slug === "girls";

      if (!isBoysOrGirls) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: boysCategory.id },
        });
        assigned++;
      }

      if (product.variants.length === 0) {
        const sku = product.sku
          ? `${product.sku}-OS`
          : `SKU-${product.id.slice(0, 8)}-OS`;
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: "One Size",
            sku,
            stock: 10,
            price: product.price,
          },
        });
        variantsCreated++;
      }
    }

    const visibleInBoys = await prisma.product.count({
      where: { categoryId: boysCategory.id },
    });
    const visibleInGirls = await prisma.product.count({
      where: { categoryId: girlsCategory.id },
    });

    try {
      revalidatePath("/collections/boys");
      revalidatePath("/collections/girls");
      revalidatePath("/collections");
      revalidatePath("/");
    } catch (e) {
      logger.error("Revalidate failed:", e);
    }

    await logActivity(
      {
        adminUserId: auth.user!.id,
        action: ActivityActions.PRODUCT_UPDATED,
        resource: "ProductVisibility",
        details: {
          assignedToBoys: assigned,
          variantsCreated,
          visibleInBoys,
          visibleInGirls,
        },
      },
      request
    );

    return apiSuccess(
      {
        visibleInBoys,
        visibleInGirls,
        assignedToBoys: assigned,
        variantsCreated,
      },
      "Product visibility updated. /collections/boys and /collections/girls will show products."
    );
  } catch (err: unknown) {
    logger.error("fix-product-visibility error:", err);
    return apiError(
      "Failed to fix product visibility",
      500,
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
