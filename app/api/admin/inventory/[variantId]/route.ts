import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const { variantId } = await params;
    const { stock } = await request.json();

    // Get current variant to track change
    const currentVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!currentVariant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    const oldStock = currentVariant.stock;

    // Update stock
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    // Log inventory change
    try {
      await prisma.inventoryLog.create({
        data: {
          variantId: variant.id,
          change: stock - oldStock,
          reason: "adjustment",
          notes: `Updated via admin panel. Previous stock: ${oldStock}, New stock: ${stock}`,
        },
      });
    } catch (logError) {
      // Silently fail if logging is not available
      console.warn("Failed to log inventory change:", logError);
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Failed to update inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}
