import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';

export const dynamic = 'force-dynamic';

/**
 * Test Login Endpoint
 * 
 * ⚠️ SECURITY: Only available in development mode
 * Diagnostic endpoint to test login credentials without rate limiting
 * and with detailed error messages for debugging.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Block in production unless explicitly enabled via environment variable
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_ENDPOINTS !== 'true') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    );
  }
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 });
    }

    // Check database connection
    if (!prisma) {
      return NextResponse.json({
        success: false,
        error: 'Database connection unavailable',
        diagnostic: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlLength: process.env.DATABASE_URL?.length || 0,
        },
      }, { status: 500 });
    }

    // Find user
    let user;
    try {
      user = await prisma.adminUser.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (dbError) {
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        diagnostic: {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
        },
      }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        diagnostic: {
          searchedEmail: email.toLowerCase().trim(),
          totalUsers: await prisma.adminUser.count(),
        },
      }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Account is inactive',
        diagnostic: {
          email: user.email,
          isActive: user.isActive,
        },
      }, { status: 403 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    return NextResponse.json({
      success: isValid,
      error: isValid ? null : 'Invalid password',
      diagnostic: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        passwordValid: isValid,
        hasPasswordHash: !!user.passwordHash,
        passwordHashLength: user.passwordHash?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      diagnostic: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    }, { status: 500 });
  }
}
