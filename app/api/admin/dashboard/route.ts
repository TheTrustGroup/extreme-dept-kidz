import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { AssignedPos, Prisma } from "@prisma/client";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

interface DashboardParams {
  startDate?: string;
  endDate?: string;
  period?: 'today' | '7days' | '30days' | 'custom';
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Viewing dashboard requires viewer role or higher
  const auth = await authenticateAndAuthorize(request, 'viewer');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    if (!prisma) {
      return apiError("Database not available", 500);
    }
    const db = prisma;

    // POS scoping: when user has assignedPos, restrict all order data to that POS
    const orderPosWhere: Prisma.OrderWhereInput = auth.user?.assignedPos
      ? { pos: auth.user.assignedPos as AssignedPos }
      : {};

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '30days') as DashboardParams['period'];
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'custom':
        if (startDateParam && endDateParam) {
          startDate = new Date(startDateParam);
          endDate = new Date(endDateParam);
        } else {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
    }

    // Previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime() - 1);

    // Fetch current period data
    const [
      currentOrders,
      prevOrders,
      currentRevenue,
      prevRevenue,
      totalProducts,
      totalCustomers,
      newCustomers,
      lowStockCount,
      ordersByStatus,
      recentOrders,
      topProductsResult,
      salesData,
    ] = await Promise.all([
      // Current period orders
      db.order.findMany({
        where: { ...orderPosWhere, createdAt: { gte: startDate, lte: endDate } },
        select: { total: true, createdAt: true },
      }),
      // Previous period orders
      db.order.findMany({
        where: { ...orderPosWhere, createdAt: { gte: prevStartDate, lte: prevEndDate } },
        select: { total: true },
      }),
      // Current period revenue
      db.order.aggregate({
        where: { ...orderPosWhere, createdAt: { gte: startDate, lte: endDate } },
        _sum: { total: true },
      }),
      // Previous period revenue
      db.order.aggregate({
        where: { ...orderPosWhere, createdAt: { gte: prevStartDate, lte: prevEndDate } },
        _sum: { total: true },
      }),
      // Total products
      db.product.count(),
      // Total customers
      db.user.count(),
      // New customers in current period
      db.user.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Low stock count
      db.productVariant.count({
        where: {
          stock: { lte: 10 },
          isActive: true,
        },
      }),
      // Orders by status
      db.order.groupBy({
        by: ['status'],
        where: { ...orderPosWhere, createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
      }),
      // Recent orders (last 5)
      db.order.findMany({
        where: orderPosWhere,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      // Top selling products (by order items)
      db.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            ...orderPosWhere,
            createdAt: { gte: startDate, lte: endDate },
            status: { not: 'CANCELLED' },
          },
        },
        _sum: {
          quantity: true,
          price: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      }).catch(() => []),
      // Sales data for chart (daily revenue)
      db.order.findMany({
        where: { ...orderPosWhere, createdAt: { gte: startDate, lte: endDate } },
        select: {
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Calculate metrics
    const totalRevenue = Number(currentRevenue._sum.total || 0);
    const prevTotalRevenue = Number(prevRevenue._sum.total || 0);
    const revenueChange = prevTotalRevenue > 0
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
      : totalRevenue > 0 ? 100 : 0;

    const totalOrders = currentOrders.length;
    const prevTotalOrders = prevOrders.length;
    const ordersChange = prevTotalOrders > 0
      ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100
      : totalOrders > 0 ? 100 : 0;

    // Get product details for top products
    const topProducts = Array.isArray(topProductsResult) ? topProductsResult : [];
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        try {
          const product = await db.product.findUnique({
            where: { id: item.productId },
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          });
          return {
            id: item.productId,
            name: product?.name || 'Unknown Product',
            sold: item._sum?.quantity || 0,
            revenue: Number(item._sum?.price || 0),
            image: product?.images[0]?.url,
          };
        } catch (error) {
          logger.error(`Error fetching product ${item.productId}:`, error);
          return {
            id: item.productId,
            name: 'Unknown Product',
            sold: item._sum?.quantity || 0,
            revenue: Number(item._sum?.price || 0),
            image: undefined,
          };
        }
      })
    );

    // Process sales data for chart (group by date)
    const salesByDate = new Map<string, number>();
    salesData.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      const current = salesByDate.get(date) || 0;
      salesByDate.set(date, current + Number(order.total));
    });

    const chartData = Array.from(salesByDate.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process orders by status
    const statusCounts = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };

    ordersByStatus.forEach((item) => {
      statusCounts[item.status as keyof typeof statusCounts] = item._count.id;
    });

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order) => {
      const shippingAddress = order.shippingAddress as { name?: string; email?: string } | null;
      const customerName = shippingAddress?.name || order.user?.name || order.user?.email || 'Guest';
      
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: customerName,
        total: Number(order.total),
        status: order.status,
        date: order.createdAt.toISOString(),
      };
    });

    return apiSuccess(
      {
        metrics: {
          revenue: totalRevenue,
          revenueChange: Math.round(revenueChange * 10) / 10,
          orders: totalOrders,
          ordersChange: Math.round(ordersChange * 10) / 10,
          products: totalProducts,
          lowStockCount,
          customers: totalCustomers,
          newCustomers,
        },
        charts: {
          salesData: chartData,
          ordersByStatus: [
            { name: 'Pending', value: statusCounts.PENDING, color: '#fbbf24' },
            { name: 'Processing', value: statusCounts.PROCESSING, color: '#3b82f6' },
            { name: 'Completed', value: statusCounts.DELIVERED, color: '#10b981' },
            { name: 'Returned', value: statusCounts.REFUNDED, color: '#ef4444' },
          ],
        },
        recentOrders: formattedRecentOrders,
        topProducts: topProductsWithDetails,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          period,
        },
      },
      "Dashboard data fetched successfully"
    );
  } catch (error) {
    logger.error("Failed to fetch dashboard data:", error);
    return apiError(
      "Failed to fetch dashboard data",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
