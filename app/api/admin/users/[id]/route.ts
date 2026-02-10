import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { apiSuccess, apiError, apiValidationError, apiNotFound } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["super_admin", "admin", "manager", "cashier", "warehouse", "driver", "viewer"]).optional(),
  assignedPos: z.enum(["main_town", "store"]).optional().nullable(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

/**
 * GET /api/admin/users/[id]
 * 
 * Get a single admin user (super_admin only, or own profile)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, 'super_admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Super admin role required to view users.' },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;

    const user = await prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assignedPos: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            activityLogs: true,
          },
        },
      },
    });

    if (!user) {
      return apiNotFound("User");
    }

    return apiSuccess(user, "User fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch user:", error);
    return apiError(
      "Failed to fetch user",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * 
 * Update an admin user (super_admin only, or own profile for name/password)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, 'super_admin');
  if (auth.error) return auth.error;
  
  const { id } = await params;
  const isOwnProfile = auth.user!.id === id;
  const isSuperAdmin = auth.authorized;

  // Users can update their own name/password, but only super_admin can change roles/status
  if (!isOwnProfile && !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Insufficient permissions. You can only update your own profile or need super admin role.' },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const body = await request.json();

    // Validate input
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(e => {
        errors[e.path.join('.')] = e.message;
      });
      return apiValidationError(errors);
    }

    const { name, email, role, assignedPos, isActive, password } = validation.data;

    // Check if user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return apiNotFound("User");
    }

    // Permission checks
    if (role && role !== existingUser.role && !isSuperAdmin) {
      return apiError("Only super admins can change user roles", 403);
    }

    if (typeof isActive === 'boolean' && isActive !== existingUser.isActive && !isSuperAdmin) {
      return apiError("Only super admins can change user status", 403);
    }

    if (email !== undefined && !isSuperAdmin) {
      return apiError("Only super admins can change user email", 403);
    }

    // If email is being changed, ensure it's not taken by another user
    if (email) {
      const normalizedEmail = email.toLowerCase();
      const taken = await prisma.adminUser.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: id },
        },
      });
      if (taken) {
        return apiError("User with this email already exists", 409);
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email && isSuperAdmin) updateData.email = email.toLowerCase();
    if (role && isSuperAdmin) updateData.role = role;
    if (assignedPos !== undefined && isSuperAdmin) updateData.assignedPos = assignedPos;
    if (typeof isActive === 'boolean' && isSuperAdmin) updateData.isActive = isActive;

    // Track if we need to increment token version (for session invalidation)
    let shouldInvalidateSessions = false;

    // Handle password update
    if (password) {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return apiValidationError({
          password: passwordValidation.errors.join(', '),
        });
      }
      updateData.passwordHash = await hashPassword(password);
      // Invalidate all sessions when password changes
      shouldInvalidateSessions = true;
    }

    // Invalidate sessions on role change (security: privileges changed)
    if (role && role !== existingUser.role && isSuperAdmin) {
      shouldInvalidateSessions = true;
    }

    // Increment token version to invalidate all existing sessions
    if (shouldInvalidateSessions) {
      updateData.tokenVersion = {
        increment: 1,
      };
    }

    type UserShape = { id: string; email: string; name: string; role: string; assignedPos: string | null; isActive: boolean; updatedAt: Date };
    let user: UserShape;

    try {
      user = await prisma.adminUser.update({
        where: { id },
        data: updateData as Parameters<typeof prisma.adminUser.update>[0]["data"],
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          assignedPos: true,
          isActive: true,
          updatedAt: true,
        },
      });
    } catch (updateErr: unknown) {
      const msg = String((updateErr as { message?: string })?.message ?? "");
      const code = (updateErr as { meta?: { code?: string } })?.meta?.code;
      if (!msg.includes("AdminRole_new") && !msg.includes("42804") && code !== "P5010") {
        throw updateErr;
      }
      // DB column may be AdminRole_new; run raw UPDATE with cast
      try {
        const setParts: Prisma.Sql[] = [];
        if (updateData.name !== undefined) setParts.push(Prisma.sql`"name" = ${updateData.name}`);
        if (updateData.email !== undefined) setParts.push(Prisma.sql`"email" = ${updateData.email}`);
        if (updateData.role !== undefined) setParts.push(Prisma.sql`"role" = ${updateData.role}::"AdminRole_new"`);
        if (updateData.assignedPos !== undefined) setParts.push(Prisma.sql`"assignedPos" = ${updateData.assignedPos}::"AssignedPos"`);
        if (updateData.isActive !== undefined) setParts.push(Prisma.sql`"isActive" = ${updateData.isActive}`);
        if (updateData.passwordHash !== undefined) setParts.push(Prisma.sql`"passwordHash" = ${updateData.passwordHash}`);
        if (updateData.tokenVersion && typeof updateData.tokenVersion === "object" && "increment" in updateData.tokenVersion) {
          setParts.push(Prisma.sql`"tokenVersion" = "tokenVersion" + 1`);
        }
        setParts.push(Prisma.sql`"updatedAt" = NOW()`);
        await prisma.$executeRaw(
          Prisma.sql`UPDATE "AdminUser" SET ${Prisma.join(setParts, ", ")} WHERE "id" = ${id}`
        );
        const updated = await prisma.adminUser.findUnique({
          where: { id },
          select: { id: true, email: true, name: true, role: true, assignedPos: true, isActive: true, updatedAt: true },
        });
        if (!updated) throw new Error("User updated but not found");
        user = updated;
      } catch (rawErr) {
        logger.error("Failed to update user (raw fallback):", rawErr);
        throw updateErr;
      }
    }

    // Log activity
    const activityDetails: Record<string, any> = {};
    if (name && name !== existingUser.name) {
      activityDetails.nameChanged = { from: existingUser.name, to: name };
    }
    if (email && email.toLowerCase() !== existingUser.email) {
      activityDetails.emailChanged = { from: existingUser.email, to: email.toLowerCase() };
    }
    if (role && role !== existingUser.role) {
      activityDetails.roleChanged = { from: existingUser.role, to: role };
    }
    if (assignedPos !== undefined && assignedPos !== existingUser.assignedPos) {
      activityDetails.assignedPosChanged = { from: existingUser.assignedPos, to: assignedPos };
    }
    if (typeof isActive === 'boolean' && isActive !== existingUser.isActive) {
      activityDetails.statusChanged = { from: existingUser.isActive, to: isActive };
    }
    if (password) {
      activityDetails.passwordChanged = true;
    }

    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.ADMIN_USER_UPDATED,
      resource: 'AdminUser',
      resourceId: id,
      details: activityDetails,
    }, request);

    return apiSuccess(user, "User updated successfully");
  } catch (error) {
    logger.error("Failed to update user:", error);
    return apiError(
      "Failed to update user",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * 
 * Permanently delete an admin user (super_admin only, cannot delete self)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // RBAC: Only super_admin can delete users
  const auth = await authenticateAndAuthorize(request, 'super_admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Super admin role required to delete users.' },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;

    // Prevent self-deletion
    if (auth.user!.id === id) {
      return apiError("You cannot delete your own account", 400);
    }

    // Check if user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return apiNotFound("User");
    }

    // Permanently delete the user (cascades to activity logs, etc. per schema)
    await prisma.adminUser.delete({
      where: { id },
    });
    const user = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      isActive: existingUser.isActive,
    };

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.ADMIN_USER_DELETED,
      resource: 'AdminUser',
      resourceId: id,
      details: {
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
      },
    }, request);

    return apiSuccess(user, "User deleted successfully");
  } catch (error) {
    logger.error("Failed to delete user:", error);
    return apiError(
      "Failed to delete user",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
