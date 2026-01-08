import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            productId: true,
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Failed to fetch collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, image, bannerImage, isActive } = body;

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        bannerImage,
        isActive,
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Failed to update collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const { id } = await params;
    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
