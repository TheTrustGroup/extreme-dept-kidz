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
        { 
          error: 'Database connection unavailable. Please check environment variables.',
          diagnostic: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            databaseUrlLength: process.env.DATABASE_URL?.length || 0,
            nodeEnv: process.env.NODE_ENV,
            vercel: !!process.env.VERCEL,
          },
          help: 'Visit /api/admin/auth/test-db for detailed diagnostics',
        },
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
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error';
      
      // Check for specific Prisma connection errors
      const isConnectionError = 
        errorMessage.includes('Can\'t reach database server') ||
        errorMessage.includes('Authentication failed') ||
        errorMessage.includes('Connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('P1001') || // Prisma connection error code
        errorMessage.includes('P1000');   // Prisma authentication error code
      
      // For admin login, we need a real database - can't use mock data
      // But provide helpful error message
      return NextResponse.json(
        { 
          error: isConnectionError 
            ? 'Unable to connect to database. Please check your database configuration in Vercel environment variables.'
            : 'Database query failed. Please try again.',
          diagnostic: process.env.NODE_ENV === 'development' ? {
            error: errorMessage,
            errorType: dbError instanceof Error ? dbError.constructor.name : typeof dbError,
            searchedEmail: normalizedEmail,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            databaseUrlLength: process.env.DATABASE_URL?.length || 0,
            help: 'Check DATABASE_URL in Vercel environment variables. Visit /api/admin/auth/test-db for diagnostics.',
          } : {
            help: 'Please contact support or check your database configuration.',
          },
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
    
    // Enhanced logging for password verification (always log in production for debugging)
    console.log('[Login] Password verification attempt:', {
      email: user.email,
      providedPasswordLength: trimmedPassword.length,
      passwordHashLength: user.passwordHash?.length || 0,
      passwordHashPrefix: user.passwordHash?.substring(0, 30) || 'none',
      passwordHashFormat: user.passwordHash?.startsWith('$2') ? 'bcrypt' : 'unknown',
    });
    
    // Check if password hash exists
    if (!user.passwordHash) {
      console.error('[Login] ❌ No password hash found for user:', user.email);
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          diagnostic: {
            message: 'User account has no password hash',
            help: 'Password needs to be reset. Use /api/admin/auth/debug-login for detailed diagnostics.',
          },
        },
        { status: 401 }
      );
    }
    
    let isValid = false;
    try {
      isValid = await verifyPassword(trimmedPassword, user.passwordHash);
    } catch (verifyError) {
      console.error('[Login] ❌ Password verification error:', verifyError);
      return NextResponse.json(
        { 
          error: 'Password verification failed',
          diagnostic: {
            message: verifyError instanceof Error ? verifyError.message : 'Unknown error',
            help: 'Use /api/admin/auth/debug-login to diagnose the issue.',
          },
        },
        { status: 500 }
      );
    }
    
    if (!isValid) {
      console.log(`[Login] ❌ Invalid password for user ${user.email}`);
      console.log('[Login] Password verification details:', {
        email: user.email,
        hasPasswordHash: !!user.passwordHash,
        passwordHashLength: user.passwordHash?.length || 0,
        providedPasswordLength: trimmedPassword.length,
        passwordHashPrefix: user.passwordHash?.substring(0, 30) || 'none',
        passwordHashFormat: user.passwordHash?.startsWith('$2') ? 'bcrypt' : 'unknown',
      });
      
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          diagnostic: {
            message: 'Password hash does not match provided password',
            help: 'Use /api/admin/auth/debug-login to get detailed diagnostics. The password may need to be reset.',
            debugEndpoint: '/api/admin/auth/debug-login',
          },
        },
        { status: 401 }
      );
    }
    
    console.log(`[Login] ✅ Password verified successfully for user ${user.email}`);

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
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax', // Works for same-site requests
      maxAge: 60 * 60 * 24 * 7, // 7 days (extended from 24 hours)
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
