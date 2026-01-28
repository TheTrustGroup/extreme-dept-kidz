import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess } from '@/lib/utils/api-response';
import { authenticateRequest } from '@/lib/auth/middleware';
import { logActivity, ActivityActions } from '@/lib/services/admin/activity.service';

export const dynamic = 'force-dynamic';

/**
 * Logout API Route
 * 
 * Clears the admin authentication cookie.
 * Always clears the cookie, even if authentication fails (for resilience).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Try to get user info before clearing cookie (for logging)
  // But don't fail if authentication fails - we still want to clear the cookie
  let user = null;
  try {
    const auth = await authenticateRequest(request);
    if (auth.user && !auth.error) {
      user = auth.user;
    }
  } catch (error) {
    // Ignore authentication errors - we still want to clear the cookie
    console.log('[Logout] User not authenticated or token invalid, clearing cookie anyway');
  }

  const response = apiSuccess({}, "Logged out successfully");
  
  // ALWAYS clear the admin-token cookie, regardless of authentication status
  // Clear cookie with multiple path variations to ensure it's removed
  // CRITICAL: Set maxAge to 0 and expires to past date to ensure browser deletes it
  const pastDate = new Date(0).toUTCString();
  
  // Clear cookie for root path
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    expires: new Date(0), // Past date
    path: '/',
  });

  // Also clear for /admin path
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/admin',
  });

  // Also clear with domain if in production
  if (process.env.NODE_ENV === 'production') {
    const domain = request.headers.get('host')?.split(':')[0];
    if (domain && !domain.includes('localhost')) {
      response.cookies.set('admin-token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 0,
        expires: new Date(0),
        path: '/',
        domain: `.${domain}`,
      });
    }
  }
  
  console.log('[Logout] Cookie cleared in response headers');

  // Log logout activity (if user was authenticated)
  if (user) {
    try {
      await logActivity({
        adminUserId: user.id,
        action: ActivityActions.LOGOUT,
        details: {
          email: user.email,
        },
      }, request);
    } catch (error) {
      // Don't fail logout if activity logging fails
      console.error('[Logout] Failed to log activity:', error);
    }
  }

  return response;
}
