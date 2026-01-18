/**
 * Activity Logs Export API Route
 * 
 * GET /api/admin/activity/export
 * 
 * Export activity logs as JSON.
 * Requires admin or super_admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAndAuthorize } from '@/lib/auth/middleware';
import { getActivityLogs } from '@/lib/services/admin/activity.service';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/activity/export
 * 
 * Export activity logs as JSON file
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate and authorize (admin or super_admin only)
    const authResult = await authenticateAndAuthorize(request, ['admin', 'super_admin']);
    if (authResult.error) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);

    // Parse filters (same as main activity route)
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
      limit: 10000, // Large limit for export
      offset: 0,
    };

    // Get all logs matching filters
    const logs = await getActivityLogs(filters);

    // Return as JSON file download
    const json = JSON.stringify(logs, null, 2);
    const filename = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logger.error('[ActivityLog] Error in export route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export activity logs',
      },
      { status: 500 }
    );
  }
}
