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

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
            variant: {
              select: {
                size: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return apiSuccess(
      {
        orders,
        count: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
      },
      "Orders fetched successfully"
    );
  } catch (error) {
    logger.error("Failed to fetch orders:", error);
    return apiError(
      "Failed to fetch orders",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
