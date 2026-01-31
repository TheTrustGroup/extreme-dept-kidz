import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { parseJsonBody } from "@/lib/utils/parse-body";
import { inventorySyncSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { withCors } from "@/lib/utils/cors";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/inventory/sync
 *
 * Syncs inventory updates from warehouse/offline queue. Single database: main site + warehouse
 * both read/write ProductVariant via this API. Uses a transaction so all-or-nothing — prevents
 * partial updates that could look like "lost" inventory.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "manager");
  if (auth.error) return withCors(request, auth.error);
  if (!auth.authorized) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Insufficient permissions. Manager role required to sync inventory." },
        { status: 403 }
      )
    );
  }

  try {
    if (!prisma) {
      return withCors(request, apiError("Database not available", 500));
    }

    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return withCors(request, parsed.response);
    const body = parsed.data;

    const validation = validate(inventorySyncSchema, body);
    if (!validation.success) {
      return withCors(request, apiValidationError(validation.errors));
    }

    const { productId, sizes } = validation.data;

    const updateResults: { size: string; variantId: string; updated?: boolean; created?: boolean }[] = [];

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { variants: true },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      for (const sizeData of sizes) {
        const { size, quantity, inStock } = sizeData;
        const qty = quantity ?? 0;
        const existingVariant = product.variants.find((v) => v.size === size);

        if (existingVariant) {
          const oldStock = existingVariant.stock;
          const variant = await tx.productVariant.update({
            where: { id: existingVariant.id },
            data: { stock: qty, isActive: inStock !== false },
          });
          await tx.inventoryLog.create({
            data: {
              variantId: variant.id,
              change: qty - oldStock,
              reason: "adjustment",
              notes: `Synced (warehouse/offline). Previous: ${oldStock}, New: ${qty}`,
            },
          });
          updateResults.push({ size, variantId: variant.id, updated: true });
        } else {
          const sku = `${product.sku || product.id}-${size}`;
          const variant = await tx.productVariant.create({
            data: {
              productId: product.id,
              size,
              sku,
              stock: qty,
              price: product.price,
              isActive: inStock !== false,
            },
          });
          await tx.inventoryLog.create({
            data: {
              variantId: variant.id,
              change: qty,
              reason: "adjustment",
              notes: `Created and synced. Initial stock: ${qty}`,
            },
          });
          updateResults.push({ size, variantId: variant.id, created: true });
        }
      }

      const hasStock = sizes.some(
        (s: { size: string; quantity?: number }) => (s.quantity ?? 0) > 0
      );
      await tx.product.update({
        where: { id: productId },
        data: { inStock: hasStock },
      });
    });

    return withCors(
      request,
      apiSuccess(
        { productId, updated: updateResults.length, results: updateResults },
        "Inventory synced successfully"
      )
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Product not found") {
      return withCors(request, apiNotFound("Product"));
    }
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return withCors(request, apiValidationError(errors));
    }
    logger.error("Failed to sync inventory:", error);
    return withCors(
      request,
      apiError(
        "Failed to sync inventory",
        500,
        error instanceof Error ? error.message : "Unknown error"
      )
    );
  }
}
