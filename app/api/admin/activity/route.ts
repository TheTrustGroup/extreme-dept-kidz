/**
 * Admin Activity Logs API Route
 * 
 * GET /api/admin/activity
 * 
 * Retrieve activity logs with filtering and pagination.
 * Requires admin or super_admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAndAuthorize } from '@/lib/auth/middleware';
import { getActivityLogs, getActivityLogsCount } from '@/lib/services/admin/activity.service';
import { apiSuccess, apiError } from '@/lib/utils/api-response';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic'; // Always fetch fresh data from database
export const revalidate = 0; // Never cache activity logs

/**
 * GET /api/admin/activity
 * 
 * Query parameters:
 * - adminUserId: Filter by admin user ID
 * - action: Filter by action type
 * - resource: Filter by resource type
 * - resourceId: Filter by resource ID
 * - startDate: Start date (ISO string)
 * - endDate: End date (ISO string)
 * - limit: Number of results (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate and authorize (admin or super_admin only)
    const authResult = await authenticateAndAuthorize(request, ['admin', 'super_admin']);
    if (authResult.error) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = {
      adminUserId: searchParams.get('adminUserId') || undefined,
      action: searchParams.get('action') || undefined,
      resource: searchParams.get('resource') || undefined,
      resourceId: searchParams.get('resourceId') || undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!, 10)
        : 50,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!, 10)
        : 0,
    };

    // Validate limit
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      return apiError('Limit must be between 1 and 100', 400);
    }

    // Get logs and count
    const [logs, total] = await Promise.all([
      getActivityLogs(filters),
      getActivityLogsCount(filters),
    ]);

    return apiSuccess(
      {
        logs,
        pagination: {
          total,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + (filters.limit || 50) < total,
        },
      },
      'Activity logs retrieved successfully'
    );
  } catch (error) {
    logger.error('[ActivityLog] Error in GET route:', error);
    return apiError(
      'Failed to retrieve activity logs',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
