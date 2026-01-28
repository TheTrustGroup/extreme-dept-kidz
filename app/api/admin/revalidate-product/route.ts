import { NextRequest, NextResponse } from 'next/server';
import { authenticateAndAuthorize } from '@/lib/auth/middleware';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS, revalidateCollectionPage, revalidateAllCollectionPages } from '@/lib/utils/cache-revalidation';
import { prisma } from '@/lib/db/prisma';
import { apiSuccess, apiError } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

/**
 * Manual Product Revalidation API
 * 
 * Use this endpoint to force revalidate a product and its collection pages
 * POST /api/admin/revalidate-product?productId=xxx or ?slug=xxx
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, 'admin');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const slug = searchParams.get('slug');

    if (!productId && !slug) {
      return apiError('Product ID or slug required', 400);
    }

    if (!prisma) {
      return apiError('Database not available', 500);
    }

    // Find product
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          productId ? { id: productId } : {},
          slug ? { slug } : {},
        ],
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return apiError('Product not found', 404);
    }

    const categorySlug = product.category?.slug;

    // Revalidate all relevant caches
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.collections);
    revalidateTag(CACHE_TAGS.categories);
    revalidateTag(CACHE_TAGS.homepage);
    revalidateTag(CACHE_TAGS.product(product.slug));
    revalidateTag(CACHE_TAGS.productId(product.id));

    if (categorySlug) {
      revalidateTag(CACHE_TAGS.category(categorySlug));
      revalidateTag(CACHE_TAGS.collection(categorySlug));
      revalidateCollectionPage(categorySlug);
      revalidatePath(`/collections/${categorySlug}`, 'page');
    }

    // Revalidate all collection pages
    await revalidateAllCollectionPages();

    // Revalidate common paths
    revalidatePath('/admin/products', 'page');
    revalidatePath('/api/products', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/products', 'page');
    revalidatePath('/collections', 'page');
    revalidatePath(`/products/${product.slug}`, 'page');

    logger.log(`[Manual Revalidation] Product: ${product.name} (${product.slug}) - Category: ${categorySlug || 'none'}`);

    return apiSuccess({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        categorySlug,
      },
      revalidated: true,
    }, 'Product cache revalidated successfully');
  } catch (error) {
    logger.error('Failed to revalidate product:', error);
    return apiError(
      'Failed to revalidate product',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
