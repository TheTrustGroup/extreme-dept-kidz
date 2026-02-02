// app/api/admin/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireManager } from '@/lib/auth/requireAdmin';
import { withCors } from '@/lib/utils/cors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/customers
 * 
 * CRITICAL SECURITY: Protected route - requires manager role or higher.
 * Returns paginated list of customers.
 */
export async function GET(request: NextRequest) {
  // CRITICAL: Server-side authentication and authorization
  const auth = await requireManager(request);
  if (auth.error) {
    return withCors(request, auth.error);
  }
  
  // auth.user is guaranteed to be non-null here
  try {
    if (!prisma) {
      return withCors(request, NextResponse.json(
        { error: 'Database not available', details: 'DATABASE_URL not set or Prisma failed to initialize' },
        { status: 500 }
      ));
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    // Fetch customers with pagination
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: 'CUSTOMER'
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          _count: {
            select: {
              orders: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER'
        }
      })
    ]);

    return withCors(request, NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }));

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return withCors(request, NextResponse.json(
      {
        error: 'Failed to fetch customers',
        details: message
      },
      { status: 500 }
    ));
  }
}
