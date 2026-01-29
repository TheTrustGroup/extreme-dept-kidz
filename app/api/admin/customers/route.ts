import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

const HIGH_VALUE_THRESHOLD_CENTS = 50000; // ₵500.00
const NEW_DAYS = 30;

/**
 * GET /api/admin/customers
 *
 * List customers with filters: all | active | inactive | highValue | new
 * Query: filter, search, page, limit, highValueThreshold
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "25", 10), 100);
    const skip = (page - 1) * limit;
    const highValueThreshold =
      parseInt(searchParams.get("highValueThreshold") || String(HIGH_VALUE_THRESHOLD_CENTS), 10) || HIGH_VALUE_THRESHOLD_CENTS;

    const where: {
      role: "CUSTOMER";
      isActive?: boolean;
      createdAt?: { gte: Date };
      id?: { in: string[] };
      OR?: Array<{ email?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" }; phone?: { contains: string; mode: "insensitive" } }>;
    } = { role: "CUSTOMER" };

    if (filter === "active") where.isActive = true;
    if (filter === "inactive") where.isActive = false;
    if (filter === "new") {
      const since = new Date();
      since.setDate(since.getDate() - NEW_DAYS);
      where.createdAt = { gte: since };
    }
    if (filter === "highValue") {
      const highValueUserIds = await prisma.order
        .groupBy({
          by: ["userId"],
          where: {
            userId: { not: null },
            paymentStatus: "COMPLETED",
          },
          _sum: { total: true },
          having: {
            total: { _sum: { gte: highValueThreshold } },
          },
        })
        .then((rows) => rows.map((r) => r.userId!).filter(Boolean));
      where.id = { in: highValueUserIds.length ? highValueUserIds : [] };
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          image: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    if (users.length === 0) {
      return apiSuccess(
        { customers: [], count: 0, total, page, totalPages: Math.ceil(total / limit) },
        "Customers fetched successfully"
      );
    }

    const userIds = users.map((u) => u.id);
    const orderStats = await prisma.order.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        paymentStatus: "COMPLETED",
      },
      _count: { id: true },
      _sum: { total: true },
    });

    const statsMap = new Map(
      orderStats.map((s) => [
        s.userId!,
        { totalOrders: s._count.id, totalSpent: s._sum.total ?? 0 },
      ])
    );

    let customers = users.map((u) => {
      const stats = statsMap.get(u.id) ?? { totalOrders: 0, totalSpent: 0 };
      return {
        id: u.id,
        name: u.name ?? "—",
        email: u.email,
        phone: u.phone ?? null,
        image: u.image ?? null,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        accountStatus: u.isActive ? "Active" : "Inactive",
        isActive: u.isActive,
        dateJoined: u.createdAt,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return apiSuccess(
      {
        customers,
        count: customers.length,
        total: filter === "highValue" ? customers.length : total,
        page,
        totalPages: filter === "highValue" ? 1 : totalPages,
      },
      "Customers fetched successfully"
    );
  } catch (error) {
    logger.error("Failed to fetch customers:", error);
    return apiError(
      "Failed to fetch customers",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
