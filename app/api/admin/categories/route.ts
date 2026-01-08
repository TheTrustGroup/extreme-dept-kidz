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

    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, slug, description, image, isActive } = body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
