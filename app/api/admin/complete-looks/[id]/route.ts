import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { apiSuccess, apiError, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { updateCompleteLookSchema, validate } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, 'viewer');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;
    const look = await (prisma as any).completeLook.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                images: true,
                variants: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!look) {
      return apiNotFound("Complete look");
    }

    return apiSuccess(look, "Complete look fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch complete look:", error);
    return apiError(
      "Failed to fetch complete look",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to update complete looks.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = validate(updateCompleteLookSchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    const validatedData = validation.data;

    // Check if look exists
    const existing = await (prisma as any).completeLook.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("Complete look");
    }

    // Build update data
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.mainImage !== undefined) updateData.mainImage = validatedData.mainImage;
    if (validatedData.bundlePrice !== undefined) {
      const bundlePrice = typeof validatedData.bundlePrice === 'number' 
        ? validatedData.bundlePrice 
        : parseFloat(String(validatedData.bundlePrice));
      if (!isNaN(bundlePrice)) {
        updateData.bundlePrice = Math.round(bundlePrice * 100);
      }
    }
    if (validatedData.bundleDiscount !== undefined) updateData.bundleDiscount = validatedData.bundleDiscount;
    if (validatedData.featured !== undefined) updateData.featured = validatedData.featured;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.ageRange !== undefined) updateData.ageRange = validatedData.ageRange;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;

    // Handle products update
    if (validatedData.productIds !== undefined) {
      // Verify all products exist
      const products = await prisma.product.findMany({
        where: {
          id: { in: validatedData.productIds },
        },
      });

      if (products.length !== validatedData.productIds.length) {
        const foundIds = products.map(p => p.id);
        const missingIds = validatedData.productIds.filter((id: string) => !foundIds.includes(id));
        return apiError(
          "Some products not found",
          404,
          `Products with IDs ${missingIds.join(', ')} do not exist`
        );
      }

      // Replace all products
      updateData.products = {
        deleteMany: {},
        create: validatedData.productIds.map((productId: string, index: number) => ({
          productId,
          isRequired: validatedData.requiredProductIds?.includes(productId) ?? true,
          order: index,
        })),
      };
    }

    // Update complete look
    const look = await (prisma as any).completeLook.update({
      where: { id },
      data: updateData,
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                images: true,
                variants: true,
              },
            },
          },
        },
      },
    });

    // Revalidate cache
    try {
      revalidatePath('/admin/looks');
      revalidatePath(`/admin/looks/${id}`);
      revalidatePath('/looks');
      revalidatePath('/style-guide');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
    }

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.COMPLETE_LOOK_UPDATED,
      resource: 'CompleteLook',
      resourceId: id,
      details: {
        name: look.name,
        changes: {
          name: validatedData.name || undefined,
          productCount: validatedData.productIds?.length || undefined,
        },
      },
    }, request);

    return apiSuccess(look, "Complete look updated successfully");
  } catch (error) {
    logger.error("Failed to update complete look:", error);
    return apiError(
      "Failed to update complete look",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Admin role required to delete complete looks.' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;

    // Check if look exists
    const existing = await (prisma as any).completeLook.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("Complete look");
    }

    // Store look info for logging before deletion
    const lookName = existing.name;

    await (prisma as any).completeLook.delete({
      where: { id },
    });

    // Revalidate cache
    try {
      revalidatePath('/admin/looks');
      revalidatePath('/looks');
      revalidatePath('/style-guide');
    } catch (revalidateError) {
      logger.error('Failed to revalidate cache:', revalidateError);
    }

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.COMPLETE_LOOK_DELETED,
      resource: 'CompleteLook',
      resourceId: id,
      details: {
        name: lookName,
      },
    }, request);

    return apiSuccess({ id }, "Complete look deleted successfully");
  } catch (error) {
    logger.error("Failed to delete complete look:", error);
    return apiError(
      "Failed to delete complete look",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
