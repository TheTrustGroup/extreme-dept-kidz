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

const addNoteSchema = z.object({
  note: z.string().min(1, "Note is required").max(5000, "Note too long"),
});

/**
 * POST /api/admin/customers/[id]/notes
 *
 * Add an internal note to a customer (timestamp + admin name stored)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "manager");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Insufficient permissions. Manager role required to add customer notes." },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id: userId } = await params;
    const body = await request.json();
    const validation = addNoteSchema.safeParse(body);
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

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: auth.user!.id },
      select: { id: true, name: true },
    });
    if (!adminUser) {
      return apiError("Admin user not found", 404);
    }

    const created = await prisma.customerNote.create({
      data: {
        userId,
        adminUserId: adminUser.id,
        note: validation.data.note,
      },
      include: {
        adminUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity(
      {
        adminUserId: auth.user!.id,
        action: ActivityActions.CUSTOMER_NOTE_ADDED,
        resource: "User",
        resourceId: userId,
        details: { noteId: created.id, customerEmail: user.email },
      },
      request
    );

    return apiSuccess(created, "Note added successfully");
  } catch (error) {
    logger.error("Failed to add customer note:", error);
    return apiError(
      "Failed to add note",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
