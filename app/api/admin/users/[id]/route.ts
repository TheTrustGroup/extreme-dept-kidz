import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiValidationError, apiNotFound } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["super_admin", "admin", "manager", "viewer"]).optional(),
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

    const { name, role, isActive, password } = validation.data;

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

    // Build update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (role && isSuperAdmin) updateData.role = role;
    if (typeof isActive === 'boolean' && isSuperAdmin) updateData.isActive = isActive;

    // Handle password update
    if (password) {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return apiValidationError({
          password: passwordValidation.errors.join(', '),
        });
      }
      updateData.passwordHash = await hashPassword(password);
    }

    // Update user
    const user = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Log activity
    const activityDetails: Record<string, any> = {};
    if (name && name !== existingUser.name) {
      activityDetails.nameChanged = { from: existingUser.name, to: name };
    }
    if (role && role !== existingUser.role) {
      activityDetails.roleChanged = { from: existingUser.role, to: role };
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
 * Delete (deactivate) an admin user (super_admin only, cannot delete self)
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

    // Soft delete by setting isActive to false
    const user = await prisma.adminUser.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

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

    return apiSuccess(user, "User deactivated successfully");
  } catch (error) {
    logger.error("Failed to delete user:", error);
    return apiError(
      "Failed to delete user",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
