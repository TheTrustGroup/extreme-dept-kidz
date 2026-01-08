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

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
