import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { searchProducts } from '@/lib/data/products';
import { apiSuccess, apiError } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';

    if (!query || query.length < 2) {
      return apiSuccess(
        { results: [], query },
        "Search query too short (minimum 2 characters)"
      );
    }

    let results;
    if (prisma) {
      const rows = await prisma.product.findMany({
        where: {
          visibleOnStore: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
            { category: { name: { contains: query, mode: 'insensitive' } } },
            { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          category: { select: { name: true } },
          images: {
            select: { url: true, isPrimary: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      results = rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        price: row.price,
        image:
          row.images.find((img) => img.isPrimary)?.url ||
          row.images[0]?.url ||
          '/placeholder.jpg',
        category: row.category.name,
      }));
    } else {
      results = await searchProducts(query, { storefrontOnly: true });
    }

    return apiSuccess(
      {
        results,
        query,
        count: results.length,
      },
      "Search completed successfully"
    );
  } catch (error) {
    logger.error('Search error:', error);
    return apiError(
      'Search failed',
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
