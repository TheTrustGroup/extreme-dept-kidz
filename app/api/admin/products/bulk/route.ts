import { NextRequest, NextResponse } from "next/server";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { revalidateOnProductMutation, CACHE_TAGS } from "@/lib/utils/cache-revalidation";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Bulk Products Actions API
 * 
 * Handles bulk operations on products:
 * - delete: Delete multiple products
 * - activate: Set products to active/published
 * - deactivate: Set products to draft
 * - assignCategory: Assign products to a category
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // RBAC: Bulk actions require admin role or higher
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const body = await request.json();
    const { ids, action, categoryId, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return apiError("No products selected", 400);
    }

    if (!['delete', 'activate', 'deactivate', 'assignCategory', 'duplicate'].includes(action)) {
      return apiError("Invalid action", 400);
    }

    // Verify all products exist
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        category: true,
        images: true,
        variants: true,
        tags: true,
      },
    });

    if (products.length !== ids.length) {
      return apiError("Some products not found", 404);
    }

    let result;
    const productNames = products.map(p => p.name);

    switch (action) {
      case 'delete':
        // Delete products
        result = await prisma.product.deleteMany({
          where: { id: { in: ids } },
        });

        // Log activity for each deletion
        for (const product of products) {
          await logActivity({
            adminUserId: auth.user!.id,
            action: ActivityActions.PRODUCT_DELETED,
            resource: 'Product',
            resourceId: product.id,
            details: {
              name: product.name,
              sku: product.sku,
            },
          }, request);
        }

        // Single contract: each mutation → revalidate before response (three truths)
        for (const product of products) {
          await revalidateOnProductMutation({
            type: "delete",
            slug: product.slug,
            id: product.id,
          });
        }
        break;

      case 'activate':
        result = await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { inStock: true },
        });

        await logActivity({
          adminUserId: auth.user!.id,
          action: ActivityActions.PRODUCT_UPDATED,
          resource: 'Product',
          resourceId: ids[0],
          details: {
            action: 'bulk_activate',
            count: ids.length,
            products: productNames.slice(0, 5), // Log first 5 names
          },
        }, request);
        break;

      case 'deactivate':
        result = await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { inStock: false },
        });

        await logActivity({
          adminUserId: auth.user!.id,
          action: ActivityActions.PRODUCT_UPDATED,
          resource: 'Product',
          resourceId: ids[0],
          details: {
            action: 'bulk_deactivate',
            count: ids.length,
            products: productNames.slice(0, 5),
          },
        }, request);
        break;

      case 'assignCategory':
        if (!categoryId) {
          return apiError("Category ID is required", 400);
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!category) {
          return apiError("Category not found", 404);
        }

        result = await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { categoryId },
        });

        await logActivity({
          adminUserId: auth.user!.id,
          action: ActivityActions.PRODUCT_UPDATED,
          resource: 'Product',
          resourceId: ids[0],
          details: {
            action: 'bulk_assign_category',
            categoryId,
            categoryName: category.name,
            count: ids.length,
            products: productNames.slice(0, 5),
          },
        }, request);
        break;

      case 'duplicate':
        // Duplicate products (create copies)
        const duplicatedProducts = [];
        for (const product of products) {
          const duplicated = await prisma.product.create({
            data: {
              name: `${product.name} (Copy)`,
              slug: `${product.slug}-copy-${Date.now()}`,
              description: product.description,
              price: product.price,
              originalPrice: product.originalPrice,
              sku: product.sku ? `${product.sku}-COPY` : undefined,
              inStock: product.inStock,
              categoryId: product.categoryId,
            },
            include: {
              images: true,
              variants: true,
              tags: true,
            },
          });

          // Copy images
          if (product.images && product.images.length > 0) {
            await prisma.productImage.createMany({
              data: product.images.map((img, idx) => ({
                productId: duplicated.id,
                url: img.url,
                alt: img.alt,
                order: img.order ?? idx,
                isPrimary: img.isPrimary ?? (idx === 0),
              })),
            });
          }

          // Copy variants
          if (product.variants && product.variants.length > 0) {
            await prisma.productVariant.createMany({
              data: product.variants.map(v => ({
                productId: duplicated.id,
                size: v.size,
                color: v.color,
                stock: v.stock,
                sku: `${v.sku}-COPY`,
                price: v.price,
                lowStockThreshold: v.lowStockThreshold,
                isActive: v.isActive,
              })),
            });
          }

          // Copy tags
          if (product.tags && product.tags.length > 0) {
            await prisma.productTag.createMany({
              data: product.tags.map(tag => ({
                productId: duplicated.id,
                name: tag.name,
              })),
              skipDuplicates: true,
            });
          }

          duplicatedProducts.push(duplicated);

          await logActivity({
            adminUserId: auth.user!.id,
            action: ActivityActions.PRODUCT_CREATED,
            resource: 'Product',
            resourceId: duplicated.id,
            details: {
              name: duplicated.name,
              duplicatedFrom: product.id,
            },
          }, request);
        }

        result = { count: duplicatedProducts.length };
        break;

      default:
        return apiError("Invalid action", 400);
    }

    // Revalidate cache
    revalidatePath('/admin/products');
    revalidateTag(CACHE_TAGS.products);

    return apiSuccess(
      {
        count: result.count || ids.length,
        action,
      },
      `Successfully ${action}d ${ids.length} product${ids.length !== 1 ? 's' : ''}`
    );
  } catch (error) {
    console.error("Bulk products action error:", error);
    return apiError(
      "Failed to perform bulk action",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
