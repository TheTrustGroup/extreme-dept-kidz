import { NextRequest, NextResponse } from "next/server";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = 'force-dynamic';

interface SearchResult {
  type: 'product' | 'order' | 'customer' | 'category';
  id: string;
  title: string;
  description?: string;
  href: string;
  thumbnail?: string;
  metadata?: Record<string, unknown>;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Searching requires viewer role or higher
  const auth = await authenticateAndAuthorize(request, 'viewer');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (!query || query.length < 2) {
      return apiSuccess(
        { results: [], query, grouped: {} },
        "Search query too short (minimum 2 characters)"
      );
    }

    if (!prisma) {
      return apiError("Database not available", 500);
    }

    const results: SearchResult[] = [];

    // Search Products (by name, SKU, description)
    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          category: {
            select: { name: true },
          },
        },
      });

      products.forEach((product) => {
        results.push({
          type: 'product',
          id: product.id,
          title: product.name,
          description: product.category?.name || undefined,
          href: `/admin/products/${product.id}`,
          thumbnail: product.images[0]?.url,
          metadata: {
            sku: product.sku,
            price: product.price,
          },
        });
      });
    } catch (error) {
      logger.error("Error searching products:", error);
    }

    // Search Orders (by order number, customer name from shippingAddress)
    try {
      const allOrders = await prisma.order.findMany({
        take: limit * 2, // Get more to filter client-side
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      const matchingOrders = allOrders.filter((order) => {
        const orderNumberMatch = order.orderNumber.toLowerCase().includes(query);
        const shippingAddress = order.shippingAddress as { name?: string; email?: string } | null;
        const customerName = shippingAddress?.name || order.user?.name || '';
        const customerEmail = shippingAddress?.email || order.user?.email || '';
        const nameMatch = customerName.toLowerCase().includes(query);
        const emailMatch = customerEmail.toLowerCase().includes(query);
        
        return orderNumberMatch || nameMatch || emailMatch;
      }).slice(0, limit);

      matchingOrders.forEach((order) => {
        const shippingAddress = order.shippingAddress as { name?: string; email?: string } | null;
        const customerName = shippingAddress?.name || order.user?.name || '';
        const customerEmail = shippingAddress?.email || order.user?.email || '';
        
        results.push({
          type: 'order',
          id: order.id,
          title: `Order #${order.orderNumber}`,
          description: customerName || customerEmail || undefined,
          href: `/admin/orders/${order.id}`,
          metadata: {
            status: order.status,
            total: order.total,
            createdAt: order.createdAt,
          },
        });
      });
    } catch (error) {
      logger.error("Error searching orders:", error);
    }

    // Search Customers (by name, email)
    try {
      const customers = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });

      customers.forEach((customer) => {
        results.push({
          type: 'customer',
          id: customer.id,
          title: customer.name || customer.email,
          description: customer.email !== customer.name ? customer.email : undefined,
          href: `/admin/customers/${customer.id}`,
          metadata: {
            email: customer.email,
          },
        });
      });
    } catch (error) {
      logger.error("Error searching customers:", error);
    }

    // Search Categories
    try {
      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });

      categories.forEach((category) => {
        results.push({
          type: 'category',
          id: category.id,
          title: category.name,
          description: category.description || undefined,
          href: `/admin/categories/${category.id}/edit`,
          metadata: {
            slug: category.slug,
            isActive: category.isActive,
          },
        });
      });
    } catch (error) {
      logger.error("Error searching categories:", error);
    }

    // Group results by type
    const grouped: Record<string, SearchResult[]> = {
      product: [],
      order: [],
      customer: [],
      category: [],
    };

    results.forEach((result) => {
      grouped[result.type].push(result);
    });

    return apiSuccess(
      {
        results,
        grouped,
        query,
        count: results.length,
      },
      "Search completed successfully"
    );
  } catch (error) {
    logger.error("Search error:", error);
    return apiError(
      "Search failed",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
