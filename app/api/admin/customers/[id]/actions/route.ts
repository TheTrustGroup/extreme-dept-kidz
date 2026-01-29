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

const actionsSchema = z.object({
  action: z.enum(["resetPassword", "sendVerification", "disable", "delete"]),
});

/**
 * POST /api/admin/customers/[id]/actions
 *
 * Account actions: resetPassword, sendVerification, disable, delete
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "admin");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Insufficient permissions. Admin role required for account actions." },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id: userId } = await params;
    const body = await request.json();
    const validation = actionsSchema.safeParse(body);
    if (!validation.success) {
      return apiValidationError({
        action: "Invalid action. Use: resetPassword, sendVerification, disable, delete",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, role: "CUSTOMER" },
    });
    if (!user) {
      return apiNotFound("Customer");
    }

    const { action } = validation.data;

    switch (action) {
      case "resetPassword": {
        // Placeholder: in production, generate reset token and send email
        await logActivity(
          {
            adminUserId: auth.user!.id,
            action: ActivityActions.CUSTOMER_PASSWORD_RESET,
            resource: "User",
            resourceId: userId,
            details: { email: user.email },
          },
          request
        );
        return apiSuccess(
          { message: "Password reset email sent (configure email service for production)." },
          "Password reset initiated"
        );
      }
      case "sendVerification": {
        // Placeholder: send verification email
        await logActivity(
          {
            adminUserId: auth.user!.id,
            action: ActivityActions.CUSTOMER_VERIFICATION_SENT,
            resource: "User",
            resourceId: userId,
            details: { email: user.email },
          },
          request
        );
        return apiSuccess(
          { message: "Verification email sent (configure email service for production)." },
          "Verification email sent"
        );
      }
      case "disable": {
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        });
        await logActivity(
          {
            adminUserId: auth.user!.id,
            action: ActivityActions.CUSTOMER_DISABLED,
            resource: "User",
            resourceId: userId,
            details: { email: user.email },
          },
          request
        );
        return apiSuccess({ isActive: false }, "Account disabled");
      }
      case "delete": {
        // Soft delete: set isActive false and optionally anonymize, or hard delete
        // Hard delete: remove user; orders keep userId for history or set null
        const ordersCount = await prisma.order.count({ where: { userId } });
        if (ordersCount > 0) {
          // Set orders to guest (userId = null) so we can delete user
          await prisma.order.updateMany({
            where: { userId },
            data: { userId: null },
          });
        }
        await prisma.customerNote.deleteMany({ where: { userId } });
        await prisma.userAddress.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });
        await logActivity(
          {
            adminUserId: auth.user!.id,
            action: ActivityActions.CUSTOMER_DELETED,
            resource: "User",
            resourceId: userId,
            details: { email: user.email },
          },
          request
        );
        return apiSuccess({ deleted: true }, "Customer deleted");
      }
      default:
        return apiValidationError({ action: "Unknown action" });
    }
  } catch (error) {
    logger.error("Failed to perform customer action:", error);
    return apiError(
      "Failed to perform action",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
