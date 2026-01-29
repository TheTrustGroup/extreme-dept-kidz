import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  apiSuccess,
  apiError,
  apiNotFound,
  apiValidationError,
} from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateAddressSchema = z.object({
  label: z.string().max(50).optional().nullable(),
  address: z
    .object({
      name: z.string().min(1).optional(),
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().min(1),
      phone: z.string().optional(),
    })
    .optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

/**
 * PATCH /api/admin/customers/[id]/addresses/[addressId]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "manager");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Insufficient permissions. Manager role required to manage addresses." },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id: userId, addressId } = await params;
    const body = await request.json();
    const validation = updateAddressSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return apiValidationError(errors);
    }

    const addr = await prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });
    if (!addr) {
      return apiNotFound("Address");
    }

    const data = validation.data;
    if (data.isDefaultShipping === true) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefaultShipping: false },
      });
    }
    if (data.isDefaultBilling === true) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefaultBilling: false },
      });
    }

    const updated = await prisma.userAddress.update({
      where: { id: addressId },
      data: {
        ...(data.label !== undefined && { label: data.label }),
        ...(data.address !== undefined && { address: data.address as object }),
        ...(data.isDefaultShipping !== undefined && { isDefaultShipping: data.isDefaultShipping }),
        ...(data.isDefaultBilling !== undefined && { isDefaultBilling: data.isDefaultBilling }),
      },
    });

    await logActivity(
      {
        adminUserId: auth.user!.id,
        action: ActivityActions.CUSTOMER_ADDRESS_UPDATED,
        resource: "User",
        resourceId: userId,
        details: { addressId },
      },
      request
    );

    return apiSuccess(updated, "Address updated successfully");
  } catch (error) {
    logger.error("Failed to update address:", error);
    return apiError(
      "Failed to update address",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]/addresses/[addressId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "manager");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Insufficient permissions. Manager role required to manage addresses." },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id: userId, addressId } = await params;

    const addr = await prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });
    if (!addr) {
      return apiNotFound("Address");
    }

    await prisma.userAddress.delete({
      where: { id: addressId },
    });

    await logActivity(
      {
        adminUserId: auth.user!.id,
        action: ActivityActions.CUSTOMER_ADDRESS_DELETED,
        resource: "User",
        resourceId: userId,
        details: { addressId },
      },
      request
    );

    return apiSuccess({ deleted: true }, "Address deleted");
  } catch (error) {
    logger.error("Failed to delete address:", error);
    return apiError(
      "Failed to delete address",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
