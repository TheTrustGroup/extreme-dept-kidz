import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

/**
 * Refresh Cookie Endpoint
 * 
 * Sets the admin-token cookie from the Authorization header.
 * This is useful when the cookie is missing but the token exists in localStorage.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify token is valid
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Set cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh cookie error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh cookie' },
      { status: 500 }
    );
  }
}
