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

const addressSchema = z.object({
  label: z.string().max(50).optional().nullable(),
  address: z.object({
    name: z.string().min(1).optional(),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

/**
 * POST /api/admin/customers/[id]/addresses
 *
 * Add a saved address for the customer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: userId } = await params;
    const body = await request.json();
    const validation = addressSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return apiValidationError(errors);
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, role: "CUSTOMER" },
    });
    if (!user) {
      return apiNotFound("Customer");
    }

    const { address, label, isDefaultShipping, isDefaultBilling } = validation.data;

    if (isDefaultShipping) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefaultShipping: false },
      });
    }
    if (isDefaultBilling) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefaultBilling: false },
      });
    }

    const created = await prisma.userAddress.create({
      data: {
        userId,
        label: label ?? null,
        address: address as object,
        isDefaultShipping: isDefaultShipping ?? false,
        isDefaultBilling: isDefaultBilling ?? false,
      },
    });

    await logActivity(
      {
        adminUserId: auth.user!.id,
        action: ActivityActions.CUSTOMER_ADDRESS_ADDED,
        resource: "User",
        resourceId: userId,
        details: { addressId: created.id, customerEmail: user.email },
      },
      request
    );

    return apiSuccess(created, "Address added successfully");
  } catch (error) {
    logger.error("Failed to add customer address:", error);
    return apiError(
      "Failed to add address",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
