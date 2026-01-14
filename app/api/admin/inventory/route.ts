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

    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

    return apiSuccess(
      {
        variants,
        count: variants.length,
        lowStock: variants.filter(v => v.stock < 10).length,
      },
      "Inventory fetched successfully"
    );
  } catch (error) {
    logger.error("Failed to fetch inventory:", error);
    return apiError(
      "Failed to fetch inventory",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
