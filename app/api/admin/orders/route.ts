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

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
