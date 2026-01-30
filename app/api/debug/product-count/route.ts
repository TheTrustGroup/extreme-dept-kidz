import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * Temporary debug endpoint: product counts from DB.
 * Remove after fixing caching issues.
 */
export async function GET(): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json({
        total: 0,
        inStock: 0,
        timestamp: new Date().toISOString(),
        error: "Database not available",
      });
    }

    const [total, inStock] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { inStock: true } }),
    ]);

    return NextResponse.json({
      total,
      inStock,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        total: 0,
        inStock: 0,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
