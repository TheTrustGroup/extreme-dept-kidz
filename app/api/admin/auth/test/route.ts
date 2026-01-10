import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to verify database connection and admin user exists
 * Remove this in production or protect it
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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
