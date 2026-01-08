import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
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

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockItems: lowStockVariants.length,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
