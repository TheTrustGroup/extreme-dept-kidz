import { NextResponse, NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/inventory/reports/[type]
 * 
 * Generate inventory reports
 * Types: valuation, movement, lowStock, slowMoving
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
): Promise<NextResponse> {
  // RBAC: Generating reports requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Manager role required to generate reports.' },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { type } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let csvData: string = '';

    switch (type) {
      case 'valuation': {
        const variants = await prisma.productVariant.findMany({
          include: {
            product: {
              select: {
                name: true,
                price: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          where: {
            isActive: true,
          },
        });

        csvData = [
          ['Product', 'Category', 'Size', 'SKU', 'Stock', 'Unit Price', 'Total Value'].join(','),
          ...variants.map(v => {
            const price = v.price || v.product.price || 0;
            const value = price * v.stock;
            return [
              `"${v.product.name}"`,
              `"${v.product.category?.name || 'Uncategorized'}"`,
              v.size,
              v.sku,
              v.stock,
              (price / 100).toFixed(2),
              (value / 100).toFixed(2),
            ].join(',');
          }),
        ].join('\n');
        break;
      }

      case 'movement': {
        const logs = await prisma.inventoryLog.findMany({
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          where: {
            createdAt: startDate && endDate ? {
              gte: new Date(startDate),
              lte: new Date(endDate),
            } : undefined,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1000,
        });

        csvData = [
          ['Date', 'Product', 'Size', 'Change', 'Reason', 'Notes'].join(','),
          ...logs.map(log => [
            log.createdAt.toISOString(),
            `"${log.variant.product.name}"`,
            log.variant.size,
            log.change,
            log.reason,
            log.notes ? `"${log.notes}"` : '',
          ].join(',')),
        ].join('\n');
        break;
      }

      case 'lowStock': {
        // Get all variants and filter in memory for low stock
        const allVariants = await prisma.productVariant.findMany({
          include: {
            product: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          where: {
            isActive: true,
          },
        });

        const variants = allVariants.filter(v => 
          v.stock === 0 || (v.stock > 0 && v.stock <= v.lowStockThreshold)
        );

        csvData = [
          ['Product', 'Category', 'Size', 'SKU', 'Current Stock', 'Reorder Point', 'Status'].join(','),
          ...variants.map(v => [
            `"${v.product.name}"`,
            `"${v.product.category?.name || 'Uncategorized'}"`,
            v.size,
            v.sku,
            v.stock,
            v.lowStockThreshold,
            v.stock === 0 ? 'Out of Stock' : 'Low Stock',
          ].join(',')),
        ].join('\n');
        break;
      }

      case 'slowMoving': {
        // Get variants with no sales in last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const variants = await prisma.productVariant.findMany({
          include: {
            product: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            inventoryLogs: {
              where: {
                reason: 'sale',
                change: { lt: 0 },
                createdAt: { gte: ninetyDaysAgo },
              },
            },
          },
          where: {
            isActive: true,
            stock: { gt: 0 },
          },
        });

        const slowMoving = variants.filter(v => v.inventoryLogs.length === 0);

        csvData = [
          ['Product', 'Category', 'Size', 'SKU', 'Current Stock', 'Days Since Last Sale'].join(','),
          ...slowMoving.map(v => [
            `"${v.product.name}"`,
            `"${v.product.category?.name || 'Uncategorized'}"`,
            v.size,
            v.sku,
            v.stock,
            '90+',
          ].join(',')),
        ].join('\n');
        break;
      }

      default:
        return apiError("Invalid report type", 400);
    }

    // Return CSV file
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error("Failed to generate report:", error);
    return apiError(
      "Failed to generate report",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
