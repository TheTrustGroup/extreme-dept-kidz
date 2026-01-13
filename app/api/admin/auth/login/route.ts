import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting - 5 attempts per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      identifier: clientIP,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!prisma) {
      console.error('Prisma client is null - DATABASE_URL may not be set');
      return NextResponse.json(
        { error: 'Database connection unavailable. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Find user - normalize email
    const normalizedEmail = email.toLowerCase().trim();
    let user;
    try {
      user = await prisma.adminUser.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection error. Please try again.',
          diagnostic: process.env.NODE_ENV === 'development' ? {
            error: dbError instanceof Error ? dbError.message : 'Unknown error',
            searchedEmail: normalizedEmail,
          } : undefined,
        },
        { status: 500 }
      );
    }

    if (!user) {
      console.log(`Login attempt failed: User not found for email ${normalizedEmail}`);
      // In development, provide more info for debugging
      if (process.env.NODE_ENV === 'development') {
        const totalUsers = await prisma.adminUser.count();
        console.log(`Total admin users in database: ${totalUsers}`);
      }
      // Don't reveal if user exists (security best practice)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Verify password - trim to avoid whitespace issues
    const trimmedPassword = password.trim();
    const isValid = await verifyPassword(trimmedPassword, user.passwordHash);
    if (!isValid) {
      console.log(`Login attempt failed: Invalid password for user ${user.email}`);
      // In development, log more details
      if (process.env.NODE_ENV === 'development') {
        console.log('Password verification failed:', {
          email: user.email,
          hasPasswordHash: !!user.passwordHash,
          passwordHashLength: user.passwordHash?.length || 0,
          providedPasswordLength: trimmedPassword.length,
        });
      }
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    if (prisma) {
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with token in both JSON and cookie
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      },
    });

    // Set cookie for middleware authentication
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    // Provide more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'Login failed';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        // Include diagnostic info in development
        ...(process.env.NODE_ENV === 'development' && {
          diagnostic: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            hasJwtSecret: !!process.env.JWT_SECRET,
            jwtSecretLength: process.env.JWT_SECRET?.length || 0,
            prismaAvailable: !!prisma,
          }
        })
      },
      { status: 500 }
    );
  }
}
