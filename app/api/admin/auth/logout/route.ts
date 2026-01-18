import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess } from '@/lib/utils/api-response';
import { authenticateRequest } from '@/lib/auth/middleware';
import { logActivity, ActivityActions } from '@/lib/services/admin/activity.service';

export const dynamic = 'force-dynamic';

/**
 * Logout API Route
 * 
 * Clears the admin authentication cookie.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Get user info before clearing cookie (for logging)
  const auth = await authenticateRequest(request);
  const user = auth.user;

  const response = apiSuccess({}, "Logged out successfully");
  
  // Clear the admin-token cookie
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  // Log logout activity (if user was authenticated)
  if (user) {
    await logActivity({
      adminUserId: user.id,
      action: ActivityActions.LOGOUT,
      details: {
        email: user.email,
      },
    }, request);
  }

  return response;
}
