import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const [totalProducts, totalOrders, orders, lowStockVariants] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        select: { total: true },
      }),
      prisma.productVariant.findMany({
        where: {
          stock: {
            lte: 10, // Low stock threshold
          },
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

    return apiSuccess(
      {
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockItems: lowStockVariants.length,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      "Statistics fetched successfully"
    );
  } catch (error) {
    logger.error("Failed to fetch stats:", error);
    return apiError(
      "Failed to fetch statistics",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
