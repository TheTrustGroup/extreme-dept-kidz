import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Logout API Route
 * 
 * Clears the admin authentication cookie.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  
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
