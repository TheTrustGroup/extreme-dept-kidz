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

const updateCustomerSchema = z.object({
  name: z.string().min(0).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional().nullable(),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/customers/[id]
 *
 * Full customer profile: info, orders, addresses, notes, analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "manager");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Insufficient permissions. Manager role required to view customers." },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: { id, role: "CUSTOMER" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                    product: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                        categoryId: true,
                        category: { select: { id: true, name: true, slug: true } },
                      },
                    },
              },
            },
          },
        },
        addresses: true,
        notes: {
          orderBy: { createdAt: "desc" },
          include: {
            adminUser: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!user) {
      return apiNotFound("Customer");
    }

    const completedOrders = user.orders.filter((o) => o.paymentStatus === "COMPLETED");
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = user.orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
    const lastOrder = user.orders[0] ?? null;

    // Most purchased category: count order items by category
    const categoryCounts: Record<string, { name: string; slug: string; count: number }> = {};
    for (const order of user.orders) {
      for (const item of order.items) {
        const cat = item.product.category;
        if (cat) {
          if (!categoryCounts[cat.id]) {
            categoryCounts[cat.id] = { name: cat.name, slug: cat.slug, count: 0 };
          }
          categoryCounts[cat.id].count += item.quantity;
        }
      }
    }
    const mostPurchasedCategory = Object.values(categoryCounts).sort(
      (a, b) => b.count - a.count
    )[0] ?? null;

    await logActivity(
      {
        adminUserId: auth.user!.id,
        action: ActivityActions.CUSTOMER_VIEWED,
        resource: "User",
        resourceId: user.id,
        details: { email: user.email },
      },
      request
    );

    const customer = {
      ...user,
      analytics: {
        totalLifetimeValue: totalSpent,
        averageOrderValue: avgOrderValue,
        totalOrders,
        mostPurchasedCategory: mostPurchasedCategory
          ? {
              name: mostPurchasedCategory.name,
              slug: mostPurchasedCategory.slug,
            }
          : null,
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
      },
    };

    return apiSuccess(customer, "Customer fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch customer:", error);
    return apiError(
      "Failed to fetch customer",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * PATCH /api/admin/customers/[id]
 *
 * Update basic info: name, email, phone, image, isActive
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "manager");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Insufficient permissions. Manager role required to update customers." },
      { status: 403 }
    );
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateCustomerSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((e) => {
        errors[e.path.join(".")] = e.message;
      });
      return apiValidationError(errors);
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "CUSTOMER" },
    });
    if (!existing) {
      return apiNotFound("Customer");
    }

    const data = validation.data;
    if (data.email !== undefined && data.email !== existing.email) {
      const taken = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (taken) {
        return apiValidationError({ email: "Email already in use" });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name || null }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const action =
      data.isActive === false
        ? ActivityActions.CUSTOMER_DISABLED
        : data.isActive === true && !existing.isActive
          ? ActivityActions.CUSTOMER_ENABLED
          : ActivityActions.CUSTOMER_UPDATED;
    await logActivity(
      {
        adminUserId: auth.user!.id,
        action,
        resource: "User",
        resourceId: id,
        details: { email: updated.email, isActive: updated.isActive },
      },
      request
    );

    return apiSuccess(updated, "Customer updated successfully");
  } catch (error) {
    logger.error("Failed to update customer:", error);
    return apiError(
      "Failed to update customer",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
