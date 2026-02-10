import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { logActivity, ActivityActions } from "@/lib/services/admin/activity.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Validation schemas (roles must match Prisma AdminRole enum)
const adminRoleEnum = z.enum(["super_admin", "admin", "manager", "cashier", "warehouse", "driver", "viewer"]);
const assignedPosEnum = z.enum(["main_town", "store"]);

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: adminRoleEnum,
  assignedPos: assignedPosEnum.optional().nullable(),
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
    const where: Prisma.AdminUserWhereInput = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role as "super_admin" | "admin" | "manager" | "cashier" | "warehouse" | "driver" | "viewer";
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

    const { email, name, password, role, assignedPos } = validation.data;

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

    const normalizedEmail = email.toLowerCase();
    let user: { id: string; email: string; name: string; role: string; assignedPos: string | null; isActive: boolean; createdAt: Date };

    let createErr: unknown = null;
    try {
      // Create user (Prisma sends role as AdminRole enum)
      user = await prisma.adminUser.create({
        data: {
          email: normalizedEmail,
          name,
          displayName: name, // DB may have NOT NULL displayName (legacy column)
          passwordHash,
          role,
          assignedPos: assignedPos ?? undefined,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          assignedPos: true,
          isActive: true,
          createdAt: true,
        },
      });
    } catch (err: unknown) {
      createErr = err;
      logger.error("Prisma adminUser.create failed, trying raw INSERT fallback:", err);
      // Always try raw INSERT (AdminRole then AdminRole_new) on any create failure
      let inserted = false;
      try {
        await prisma.$executeRaw(
          Prisma.sql`
            INSERT INTO "AdminUser" (
              "id", "email", "name", "displayName", "passwordHash", "role", "assignedPos", "isActive",
              "lastLoginAt", "passwordResetToken", "passwordResetExpiresAt", "passwordResetRequestedAt",
              "tokenVersion", "createdAt", "updatedAt"
            ) VALUES (
              gen_random_uuid()::text, ${normalizedEmail}, ${name}, ${name}, ${passwordHash},
              ${role}::"AdminRole", ${assignedPos ?? null}::"AssignedPos", true,
              NULL, NULL, NULL, NULL, 0, NOW(), NOW()
            )
          `
        );
        inserted = true;
      } catch {
        try {
          await prisma.$executeRaw(
            Prisma.sql`
              INSERT INTO "AdminUser" (
                "id", "email", "name", "displayName", "passwordHash", "role", "assignedPos", "isActive",
                "lastLoginAt", "passwordResetToken", "passwordResetExpiresAt", "passwordResetRequestedAt",
                "tokenVersion", "createdAt", "updatedAt"
              ) VALUES (
                gen_random_uuid()::text, ${normalizedEmail}, ${name}, ${name}, ${passwordHash},
                ${role}::"AdminRole_new", ${assignedPos ?? null}::"AssignedPos", true,
                NULL, NULL, NULL, NULL, 0, NOW(), NOW()
              )
            `
          );
          inserted = true;
        } catch (rawErr) {
          logger.error("Raw INSERT fallback failed:", rawErr);
        }
      }
      if (inserted) {
        const created = await prisma.adminUser.findUnique({
          where: { email: normalizedEmail },
          select: { id: true, email: true, name: true, role: true, assignedPos: true, isActive: true, createdAt: true },
        });
        if (!created) throw new Error("User created but not found");
        user = created;
      } else {
        throw createErr;
      }
    }

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
    const message = error instanceof Error ? error.message : "Unknown error";
    const prismaCode = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
    const isEnumError =
      message.includes("enum") ||
      message.includes("AdminRole") ||
      message.includes("invalid input value") ||
      message.includes("42804") ||
      prismaCode === "P5010" ||
      /type.*mismatch|invalid.*enum/i.test(message);
    const isUniqueError =
      prismaCode === "P2002" ||
      message.toLowerCase().includes("unique") ||
      message.toLowerCase().includes("already exists");
    if (isEnumError && !isUniqueError) {
      return apiError(
        "Invalid role or database schema out of date. For POS/warehouse users, run the migration that adds cashier and warehouse roles: prisma/migrations/20250202120000_add_admin_roles_cashier_warehouse_driver (or run fix_admin_role_enum_one_time.sql in your DB SQL editor).",
        400,
        message
      );
    }
    if (isUniqueError) {
      return apiError("User with this email already exists", 409, message);
    }
    return apiError(message || "Failed to create user", 500, message);
  }
}
