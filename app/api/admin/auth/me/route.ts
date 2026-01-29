import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';
import { withCors } from '@/lib/utils/cors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);

  if (authResult.error) {
    return withCors(request, authResult.error);
  }

  // Fetch full user details including name
  if (!prisma || !authResult.user) {
    return withCors(request, apiError('Database connection unavailable', 500));
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
      return withCors(request, apiUnauthorized('User not found or inactive'));
    }

    // Return format expected by admin-auth-store.ts
    // Note: Must match the format expected by checkAuth() and refreshAuth()
    // The store checks for both data.user and user, so return both formats for compatibility
    return withCors(request, apiSuccess(
      {
        user: {
          id: fullUser.id,
          email: fullUser.email,
          name: fullUser.name,
          role: fullUser.role,
        },
      },
      'User fetched successfully'
    ));
  } catch (error) {
    logger.error('Error fetching user:', error);
    return withCors(request, apiError(
      'Failed to fetch user',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    ));
  }
}
