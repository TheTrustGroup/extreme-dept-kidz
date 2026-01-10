import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalidation API Route
 * 
 * Allows manual cache revalidation for specific paths or tags.
 * Used after product updates to ensure changes appear immediately on the site.
 * 
 * Usage:
 * POST /api/revalidate
 * Body: { path: '/products' } or { tag: 'products' }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // In production, add authentication here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { path, tag } = body;

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ 
        revalidated: true, 
        now: Date.now(),
        path 
      });
    }

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ 
        revalidated: true, 
        now: Date.now(),
        tag 
      });
    }

    return NextResponse.json(
      { error: 'Path or tag is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { error: 'Error revalidating cache' },
      { status: 500 }
    );
  }
}
