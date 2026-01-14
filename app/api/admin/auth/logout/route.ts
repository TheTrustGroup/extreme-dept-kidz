import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';

/**
 * Logout API Route
 * 
 * Clears the admin authentication cookie.
 */
export async function POST(_request: NextRequest): Promise<NextResponse> {
  const response = apiSuccess({}, "Logged out successfully");
  
  // Clear the admin-token cookie
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return response;
}
