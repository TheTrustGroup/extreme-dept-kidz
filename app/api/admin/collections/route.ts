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

    const collections = await prisma.collection.findMany({
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
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
    const { name, slug, description, image, bannerImage, isActive } = body;

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        image,
        bannerImage,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Failed to create collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
