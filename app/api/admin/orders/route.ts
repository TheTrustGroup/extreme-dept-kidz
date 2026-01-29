import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Viewing orders requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions. Manager role required to view orders.' }, { status: 403 });
  }
  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const fulfillmentStatus = searchParams.get('fulfillmentStatus') || '';
    const customerSearch = searchParams.get('customer') || '';
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const shippingMethod = searchParams.get('shippingMethod') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Status filter (fulfillment status)
    if (status) {
      where.status = status;
    }

    // Payment status filter
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // Fulfillment status filter (maps to status)
    if (fulfillmentStatus && !status) {
      where.status = fulfillmentStatus;
    }

    // Customer search
    if (customerSearch) {
      where.OR = [
        { user: { email: { contains: customerSearch, mode: 'insensitive' } } },
        { user: { name: { contains: customerSearch, mode: 'insensitive' } } },
        // JSON search for shipping address (guest orders)
        { shippingAddress: { path: ['name'], string_contains: customerSearch } },
        { shippingAddress: { path: ['email'], string_contains: customerSearch } },
      ];
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      where.total = {};
      if (minAmount) {
        where.total.gte = parseInt(minAmount, 10) * 100; // Convert to cents
      }
      if (maxAmount) {
        where.total.lte = parseInt(maxAmount, 10) * 100; // Convert to cents
      }
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Shipping method filter (stored in metadata or carrier)
    if (shippingMethod) {
      where.carrier = shippingMethod;
    }

    // Get total count for pagination
    const total = await prisma.order.count({ where });

    // Fetch orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: {
                    url: true,
                    alt: true,
                    isPrimary: true,
                    order: true,
                  },
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                size: true,
                color: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return apiSuccess(
      {
        orders,
        count: orders.length,
        total,
        page,
        totalPages,
        totalRevenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
      },
      "Orders fetched successfully"
    );
  } catch (error) {
    logger.error("Failed to fetch orders:", error);
    return apiError(
      "Failed to fetch orders",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
