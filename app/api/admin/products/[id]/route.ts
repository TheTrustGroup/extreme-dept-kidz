import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { withCors } from "@/lib/utils/cors";
import { apiSuccess, apiError, apiNotFound } from "@/lib/utils/api-response";
import { parseJsonBody } from "@/lib/utils/parse-body";
import { revalidateOnProductMutation } from "@/lib/utils/cache-revalidation";
import { triggerProductUpdatedWebhook } from "@/lib/utils/trigger-product-webhook";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// GET - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "viewer");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return withCors(
      request,
      NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    );
  }
  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500));
    }
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { order: "asc" } },
      },
    });

    if (!product) {
      return withCors(request, apiNotFound("Product"));
    }

    // Form compatibility: include sizes from variants and categoryId (form expects sizes[])
    const forForm = {
      ...product,
      categoryId: product.categoryId ?? product.category?.id ?? null,
      sizes: (product.variants ?? []).map((v) => ({
        size: v.size,
        quantity: v.stock ?? 0,
      })),
    };

    return withCors(request, apiSuccess(forForm));
  } catch (error: unknown) {
    logger.error("Get product error:", error);
    return withCors(
      request,
      apiError(
        "Failed to fetch product",
        500,
        error instanceof Error ? error.message : "Unknown error"
      )
    );
  }
}

// PUT - Update product (supports unified ProductFormComprehensive payload)
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "admin");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Insufficient permissions. Admin role required to update products." },
        { status: 403 }
      )
    );
  }
  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500));
    }
    const { id } = await params;
    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return withCors(request, parsed.response);
    const body = parsed.data as {
      name?: string;
      description?: string;
      slug?: string;
      categoryId?: string;
      visibleOnStore?: boolean;
      /** Base price in major units (e.g. dollars); stored as cents in DB */
      price?: number;
      originalPrice?: number | null;
      variants?: Array<{
        id: string;
        name?: string;
        sku?: string;
        price?: number;
        stock?: number;
        comparePrice?: number | null;
      }>;
      images?: Array<{ id?: string; url: string; alt?: string; position?: number }>;
    };

    const { name, description, slug, categoryId, variants, images, visibleOnStore, price, originalPrice } =
      body;

    const updateData: Parameters<typeof prisma.product.update>[0]["data"] = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(slug !== undefined && { slug }),
      ...(categoryId !== undefined && { categoryId }),
      ...(typeof visibleOnStore === "boolean" && { visibleOnStore }),
      ...(typeof price === "number" && Number.isFinite(price) && price >= 0 && {
        price: Math.round(price * 100),
      }),
    };

    if (Object.prototype.hasOwnProperty.call(body, "originalPrice")) {
      if (originalPrice === null) {
        updateData.originalPrice = null;
      } else if (
        typeof originalPrice === "number" &&
        Number.isFinite(originalPrice) &&
        originalPrice >= 0
      ) {
        updateData.originalPrice = Math.round(originalPrice * 100);
      }
    }

    // Update product base fields
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Sync variants (schema: size, sku, price in cents, stock; form sends name -> size, price in dollars)
    if (variants && Array.isArray(variants)) {
      const existingIds = variants
        .filter((v) => v.id && !String(v.id).startsWith("new-"))
        .map((v) => v.id);

      await prisma.productVariant.deleteMany({
        where: {
          productId: id,
          id: { notIn: existingIds },
        },
      });

      for (const v of variants) {
        const size = (v.name ?? "One Size").trim() || "One Size";
        const priceCents =
          v.price != null ? Math.round(Number(v.price) * 100) : null;
        const stock = Math.max(0, Math.floor(Number(v.stock) ?? 0));
        const sku = (v.sku ?? "").trim() || `${product.sku ?? "SKU"}-${size}-${Date.now()}`;

        if (v.id && String(v.id).startsWith("new-")) {
          await prisma.productVariant.create({
            data: {
              productId: id,
              size,
              sku,
              price: priceCents,
              stock,
            },
          });
        } else if (v.id) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: { size, sku, price: priceCents, stock },
          });
        }
      }
    }

    // Sync images (schema: url, alt, order)
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((img, index) => ({
          productId: id,
          url: (img.url ?? "").trim() || "/placeholder.png",
          alt: (img.alt ?? "").trim() || product.name,
          isPrimary: index === 0,
          order: img.position ?? index,
        })),
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { order: "asc" } },
      },
    });

    await revalidateOnProductMutation({
      type: "update",
      slug: updated!.slug,
      id: updated!.id,
      categorySlug: updated!.category?.slug,
    });
    triggerProductUpdatedWebhook({
      productId: updated!.id,
      productSlug: updated!.slug,
      action: "updated",
      categorySlug: updated!.category?.slug,
    });

    return withCors(request, apiSuccess(updated, "Product updated successfully"));
  } catch (error: unknown) {
    logger.error("Update product error:", error);
    return withCors(
      request,
      apiError(
        "Failed to update product",
        500,
        error instanceof Error ? error.message : "Unknown error"
      )
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "admin");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Insufficient permissions. Admin role required to delete products." },
        { status: 403 }
      )
    );
  }
  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500));
    }
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return withCors(request, apiNotFound("Product"));
    }

    await prisma.product.delete({
      where: { id },
    });

    await revalidateOnProductMutation({
      type: "delete",
      slug: existing.slug,
      id: existing.id,
    });
    triggerProductUpdatedWebhook({
      productId: id,
      productSlug: existing.slug,
      action: "deleted",
    });

    return withCors(
      request,
      apiSuccess({ id, message: "Product deleted successfully" }, "Product deleted successfully")
    );
  } catch (error: unknown) {
    logger.error("Delete product error:", error);
    if (error instanceof Error && error.message.includes("Foreign key constraint")) {
      return withCors(
        request,
        apiError(
          "Cannot delete product: it is associated with orders",
          409,
          "Archive the product instead of deleting it"
        )
      );
    }
    return withCors(
      request,
      apiError(
        "Failed to delete product",
        500,
        error instanceof Error ? error.message : "Unknown error"
      )
    );
  }
}
