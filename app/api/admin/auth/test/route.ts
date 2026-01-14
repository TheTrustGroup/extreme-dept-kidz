import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to verify database connection and admin user exists
 * ⚠️ SECURITY: Only available in development mode
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  // Block in production unless explicitly enabled via environment variable
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_ENDPOINTS !== 'true') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    );
  }
  try {
    // Check Prisma connection
    if (!prisma) {
      return NextResponse.json({
        error: 'Prisma client is null',
        databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
      }, { status: 500 });
    }

    // Try to query admin users
    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      prismaConnected: true,
      adminUserCount: adminUsers.length,
      adminUsers: adminUsers,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
    }, { status: 500 });
  }
}
