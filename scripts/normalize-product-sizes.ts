/**
 * Normalize legacy product variant sizes to canonical age-first sizes.
 *
 * Canonical order: 3M, 6M, 9M, 1Y ... 12Y
 *
 * Behavior:
 * - Maps legacy labels (2T/3T/4T/5T/6/8/10/12...) to canonical labels.
 * - Merges duplicate variants that collapse to same (productId, size, color).
 * - Re-points OrderItem and InventoryLog references to the kept variant.
 * - Recalculates product.inStock from variant stock.
 *
 * Usage:
 * - Dry run (default): npm run normalize-sizes
 * - Explicit dry run:   npm run normalize-sizes -- --dry-run
 * - Apply changes:      npm run normalize-sizes -- --apply
 */

import { config } from "dotenv";
import { resolve } from "path";
import { getPrisma } from "../lib/db/prisma";
import { normalizeProductSizeLabel } from "../lib/constants/product-sizes";

try {
  config({ path: resolve(process.cwd(), ".env.local") });
} catch {}
try {
  config({ path: resolve(process.cwd(), ".env") });
} catch {}

type VariantRow = {
  id: string;
  productId: string;
  size: string;
  color: string | null;
  stock: number;
  reserved: number;
  createdAt: Date;
};

function parseFlags(argv: string[]): { dryRun: boolean } {
  const hasApply = argv.includes("--apply");
  return { dryRun: !hasApply };
}

function groupKey(size: string, color: string | null): string {
  return `${size}::${color ?? ""}`;
}

async function run(): Promise<void> {
  const { dryRun } = parseFlags(process.argv.slice(2));
  const prisma = getPrisma();
  if (!prisma) {
    console.error("❌ Prisma client not available. Ensure DATABASE_URL is configured.");
    process.exit(1);
  }

  const summary = {
    productsVisited: 0,
    variantsVisited: 0,
    variantsWithLegacySize: 0,
    variantsUpdatedSizeOnly: 0,
    variantMerges: 0,
    orderItemsRepointed: 0,
    inventoryLogsRepointed: 0,
    productsInStockRecalculated: 0,
  };

  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, inStock: true },
      orderBy: { createdAt: "asc" },
    });

    summary.productsVisited = products.length;
    console.log(`\n🔎 Starting size normalization (${dryRun ? "DRY RUN" : "APPLY"})`);
    console.log(`📦 Products to inspect: ${products.length}\n`);

    for (const product of products) {
      const variants = await prisma.productVariant.findMany({
        where: { productId: product.id },
        select: {
          id: true,
          productId: true,
          size: true,
          color: true,
          stock: true,
          reserved: true,
          createdAt: true,
        },
      });

      if (variants.length === 0) continue;
      summary.variantsVisited += variants.length;

      const normalizedById = new Map<string, string | null>();
      for (const variant of variants) {
        const normalized = normalizeProductSizeLabel(variant.size);
        normalizedById.set(variant.id, normalized);
        if (normalized !== null && normalized !== variant.size.trim().toUpperCase()) {
          summary.variantsWithLegacySize += 1;
        }
      }

      const relevant = variants.filter((variant) => normalizedById.get(variant.id) !== null);
      if (relevant.length === 0) continue;

      const groups = new Map<string, VariantRow[]>();
      for (const variant of relevant) {
        const normalized = normalizedById.get(variant.id);
        if (!normalized) continue;
        const key = groupKey(normalized, variant.color);
        const bucket = groups.get(key);
        if (bucket) {
          bucket.push(variant);
        } else {
          groups.set(key, [variant]);
        }
      }

      let productChanged = false;

      for (const [key, bucket] of groups.entries()) {
        const [normalizedSize] = key.split("::");
        bucket.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        const keeper =
          bucket.find((v) => v.size.trim().toUpperCase() === normalizedSize) ?? bucket[0];
        const duplicates = bucket.filter((v) => v.id !== keeper.id);
        if (duplicates.length === 0) {
          if (keeper.size.trim().toUpperCase() !== normalizedSize) {
            productChanged = true;
            summary.variantsUpdatedSizeOnly += 1;
            if (!dryRun) {
              await prisma.productVariant.update({
                where: { id: keeper.id },
                data: { size: normalizedSize },
              });
            }
          }
          continue;
        }

        productChanged = true;
        summary.variantMerges += duplicates.length;

        let mergedStock = keeper.stock;
        let mergedReserved = keeper.reserved;

        for (const duplicate of duplicates) {
          mergedStock += duplicate.stock;
          mergedReserved += duplicate.reserved;

          if (!dryRun) {
            const [orderItemsResult, inventoryLogsResult] = await Promise.all([
              prisma.orderItem.updateMany({
                where: { variantId: duplicate.id },
                data: { variantId: keeper.id },
              }),
              prisma.inventoryLog.updateMany({
                where: { variantId: duplicate.id },
                data: { variantId: keeper.id },
              }),
            ]);

            summary.orderItemsRepointed += orderItemsResult.count;
            summary.inventoryLogsRepointed += inventoryLogsResult.count;

            await prisma.productVariant.delete({ where: { id: duplicate.id } });
          }
        }

        if (!dryRun) {
          await prisma.productVariant.update({
            where: { id: keeper.id },
            data: {
              size: normalizedSize,
              stock: mergedStock,
              reserved: mergedReserved,
              isActive: true,
            },
          });
        }
      }

      if (productChanged) {
        const nextVariants = dryRun
          ? variants.map((v) => {
              const normalized = normalizedById.get(v.id);
              return {
                ...v,
                size: normalized ?? v.size,
              };
            })
          : await prisma.productVariant.findMany({
              where: { productId: product.id },
              select: { stock: true },
            });

        const nextInStock = nextVariants.some((v) => v.stock > 0);
        if (nextInStock !== product.inStock) {
          summary.productsInStockRecalculated += 1;
          if (!dryRun) {
            await prisma.product.update({
              where: { id: product.id },
              data: { inStock: nextInStock },
            });
          }
        }
      }
    }

    console.log("✅ Size normalization finished.\n");
    console.log("Summary");
    console.log(`- Products visited: ${summary.productsVisited}`);
    console.log(`- Variants visited: ${summary.variantsVisited}`);
    console.log(`- Legacy-sized variants detected: ${summary.variantsWithLegacySize}`);
    console.log(`- Variants updated (size-only): ${summary.variantsUpdatedSizeOnly}`);
    console.log(`- Variants merged: ${summary.variantMerges}`);
    console.log(`- OrderItems repointed: ${summary.orderItemsRepointed}`);
    console.log(`- InventoryLogs repointed: ${summary.inventoryLogsRepointed}`);
    console.log(`- Products with inStock recalculated: ${summary.productsInStockRecalculated}`);
    console.log(`- Mode: ${dryRun ? "DRY RUN (no writes)" : "APPLY (changes persisted)"}`);
  } catch (error) {
    console.error("❌ Normalization failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void run();
