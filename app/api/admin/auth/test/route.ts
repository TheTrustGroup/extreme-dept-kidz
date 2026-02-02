import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '@/lib/auth/requireAdmin';
import { withCors } from '@/lib/utils/cors';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to verify database connection and admin user exists
 * 
 * ⚠️ CRITICAL SECURITY: This endpoint exposes admin user list.
 * 
 * SECURITY POLICY:
 * - In production: Completely disabled (returns 404)
 * - In development: Requires super_admin authentication
 * - Never accessible without authentication
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // CRITICAL: Completely disable in production (no env var override)
  if (process.env.NODE_ENV === 'production') {
    return withCors(request, NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    ));
  }
  
  // In development, require super_admin authentication
  const auth = await requireSuperAdmin(request);
  if (auth.error) {
    return withCors(request, auth.error);
  }
  try {
    // Check Prisma connection
    if (!prisma) {
      return withCors(request, NextResponse.json({
        error: 'Prisma client is null',
        databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
      }, { status: 500 }));
    }

    // Try to query admin users (only in development, with super_admin auth)
    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return withCors(request, NextResponse.json({
      success: true,
      prismaConnected: true,
      adminUserCount: adminUsers.length,
      adminUsers: adminUsers,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    }));
  } catch (error) {
    return withCors(request, NextResponse.json({
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
    }, { status: 500 }));
  }
}
