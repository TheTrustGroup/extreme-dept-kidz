import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken, setCSRFTokenCookie } from '@/lib/auth/csrf';
import { authenticateRequest } from '@/lib/auth/middleware';
import { withCors } from '@/lib/utils/cors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/csrf-token
 * 
 * Returns CSRF token for authenticated admin users
 * Token is also set as HttpOnly cookie
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Require authentication
  const auth = await authenticateRequest(request);
  if (auth.error || !auth.user) {
    return withCors(request, NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    ));
  }

  // Generate new CSRF token
  const csrfToken = generateCSRFToken();
  
  // Create response with token
  const response = NextResponse.json({
    success: true,
    csrfToken,
  });

  // Set CSRF token cookie
  setCSRFTokenCookie(response, csrfToken);

  return withCors(request, response);
}
