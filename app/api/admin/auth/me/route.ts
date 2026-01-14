import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);

  if (authResult.error) {
    return authResult.error;
  }

  // Fetch full user details including name
  if (!prisma || !authResult.user) {
    return apiError('Database connection unavailable', 500);
  }

  try {
    const fullUser = await prisma.adminUser.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!fullUser || !fullUser.isActive) {
      return apiUnauthorized('User not found or inactive');
    }

    // Return format expected by admin-auth-store.ts
    // Note: Must match the format expected by checkAuth() and refreshAuth()
    return NextResponse.json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
      },
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    return apiError(
      'Failed to fetch user',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
