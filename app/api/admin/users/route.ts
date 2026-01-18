import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["super_admin", "admin", "manager", "viewer"]),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["super_admin", "admin", "manager", "viewer"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

/**
 * GET /api/admin/users
 * 
 * List all admin users (super_admin only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Only super_admin can view all users
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const isActive = searchParams.get('isActive');

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const users = await prisma.adminUser.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return apiSuccess(
      {
        users,
        count: users.length,
      },
      "Users fetched successfully"
    );
  } catch (error) {
    logger.error("Failed to fetch users:", error);
    return apiError(
      "Failed to fetch users",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * POST /api/admin/users
 * 
 * Create a new admin user (super_admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // RBAC: Only super_admin can create users
  const auth = await authenticateAndAuthorize(request, 'super_admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Super admin role required to create users.' },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const body = await request.json();

    // Validate input
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(e => {
        errors[e.path.join('.')] = e.message;
      });
      return apiValidationError(errors);
    }

    const { email, name, password, role } = validation.data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return apiValidationError({
        password: passwordValidation.errors.join(', '),
      });
    }

    // Check if user already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return apiError("User with this email already exists", 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log activity
    await logActivity({
      adminUserId: auth.user!.id,
      action: ActivityActions.ADMIN_USER_CREATED,
      resource: 'AdminUser',
      resourceId: user.id,
      details: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, request);

    const response = apiSuccess(user, "User created successfully");
    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "User created successfully",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to create user:", error);
    return apiError(
      "Failed to create user",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
