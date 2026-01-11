import { NextRequest, NextResponse } from 'next/server';
import { mockProducts } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], query });
    }

    // Search in product name, description, tags, and category
    const results = mockProducts
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

    return NextResponse.json({
      results,
      query,
      count: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
