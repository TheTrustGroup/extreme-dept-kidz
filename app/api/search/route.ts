import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/db';
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

    // Fetch products from database
    const products = await getAllProducts();

    // Search in product name, description, tags, and category
    const results = products
      .filter((product) => {
        const searchableText = [
          product.name,
          product.description,
          ...(product.tags || []),
          product.category.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 20) // Limit to 20 results
      .map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0]?.url || '/placeholder.jpg',
        category: product.category.name,
      }));

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
