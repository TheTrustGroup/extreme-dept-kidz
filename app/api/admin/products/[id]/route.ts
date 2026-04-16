import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { withCors } from "@/lib/utils/cors";
import { apiSuccess, apiError, apiNotFound } from "@/lib/utils/api-response";
import { parseJsonBody } from "@/lib/utils/parse-body";
import { revalidateOnProductMutation } from "@/lib/utils/cache-revalidation";
import { triggerProductUpdatedWebhook } from "@/lib/utils/trigger-product-webhook";
import { logger } from "@/lib/utils/logger";
import { normalizeProductSizeLabel } from "@/lib/constants/product-sizes";

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
      /** Base price in major units (e.g. cedis); stored as pesewas in DB */
      price?: number;
      originalPrice?: number | null;
      /** ProductFormComprehensive sends sizes + quantity (same as POST create) */
      sizes?: Array<{ size: string; quantity?: number }>;
      variants?: Array<{
        id: string;
        name?: string;
        sku?: string;
        price?: number;
        stock?: number;
        comparePrice?: number | null;
      }>;
      /** String URLs or { url } objects */
      images?: Array<string | { id?: string; url: string; alt?: string; position?: number }>;
    };

    const { name, description, slug, categoryId, variants, images, visibleOnStore, price, originalPrice, sizes: sizesPayload } =
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

    // Sync variants from ProductFormComprehensive `sizes` (preferred) or legacy `variants`
    if (sizesPayload && Array.isArray(sizesPayload) && sizesPayload.length > 0) {
      const baseSku = (product.sku ?? `SKU-${id.slice(0, 8)}`).replace(/\s+/g, "-").toUpperCase();
      const normalizedSizeStock = new Map<string, number>();

      for (const s of sizesPayload) {
        const incomingSize = String(s.size ?? "").trim();
        const normalizedSize = incomingSize ? normalizeProductSizeLabel(incomingSize) : null;
        const sizeLabel = normalizedSize ?? incomingSize;
        if (!sizeLabel) continue;
        const stock = Math.max(0, Math.floor(Number(s.quantity ?? 0)));
        normalizedSizeStock.set(sizeLabel, stock);
      }

      const targetVariants = [...normalizedSizeStock.entries()].map(([size, stock]) => ({ size, stock }));
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id, color: null },
        select: { id: true, size: true, sku: true },
      });
      const existingBySize = new Map(existingVariants.map((variant) => [variant.size, variant]));
      const keptVariantIds: string[] = [];

      for (const target of targetVariants) {
        const existing = existingBySize.get(target.size);
        const sku =
          existing?.sku ??
          `${baseSku}-${target.size.replace(/\s+/g, "-").toUpperCase()}`.slice(0, 120);

        if (existing) {
          const updated = await prisma.productVariant.update({
            where: { id: existing.id },
            data: {
              stock: target.stock,
              sku,
              isActive: true,
            },
            select: { id: true },
          });
          keptVariantIds.push(updated.id);
          continue;
        }

        const created = await prisma.productVariant.create({
          data: {
            productId: id,
            size: target.size,
            color: null,
            stock: target.stock,
            sku,
            isActive: true,
          },
          select: { id: true },
        });
        keptVariantIds.push(created.id);
      }

      await prisma.productVariant.deleteMany({
        where: {
          productId: id,
          color: null,
          ...(keptVariantIds.length > 0 ? { id: { notIn: keptVariantIds } } : {}),
        },
      });
    } else if (variants && Array.isArray(variants)) {
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
        const incomingSize = (v.name ?? "One Size").trim() || "One Size";
        const size = normalizeProductSizeLabel(incomingSize) ?? incomingSize;
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

    // Sync images — form often sends string[] URLs; also accept { url } objects
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((img, index) => {
          const url =
            typeof img === "string"
              ? img.trim()
              : String((img as { url?: string }).url ?? "").trim();
          const altFromObj =
            typeof img === "object" && img != null && "alt" in img
              ? String((img as { alt?: string }).alt ?? "").trim()
              : "";
          const pos =
            typeof img === "object" && img != null && "position" in img
              ? Number((img as { position?: number }).position)
              : index;
          return {
            productId: id,
            url: url || "/placeholder.png",
            alt: altFromObj || product.name,
            isPrimary: index === 0,
            order: Number.isFinite(pos) ? pos : index,
          };
        }),
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

    void revalidateOnProductMutation({
      type: "update",
      slug: updated!.slug,
      id: updated!.id,
      categorySlug: updated!.category?.slug,
    }).catch((err) => logger.error("[Product PUT] revalidateOnProductMutation:", err));
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

    void revalidateOnProductMutation({
      type: "delete",
      slug: existing.slug,
      id: existing.id,
    }).catch((err) => logger.error("[Product DELETE] revalidateOnProductMutation:", err));
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
