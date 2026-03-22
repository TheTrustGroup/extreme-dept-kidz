import { NextRequest, NextResponse } from 'next/server';
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

    const results = await searchProducts(query, { storefrontOnly: true });

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
