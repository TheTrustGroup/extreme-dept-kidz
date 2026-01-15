import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit';
import { detectBot } from '@/lib/security/bot-detector';
import { apiSuccess, apiError, apiValidationError, apiRateLimit, apiUnauthorized } from '@/lib/utils/api-response';
import { adminLoginSchema, validate } from '@/lib/validation/schemas';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

// Track failed login attempts
const failedAttempts = new Map<string, number>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. BOT DETECTION
    const botDetection = detectBot(request);
    
    if (botDetection.isBot && botDetection.score > 70) {
      logger.warn('🤖 Bot detected on login:', botDetection.reasons);
      return apiError(
        'Suspicious activity detected',
        403,
        'Request blocked by security system'
      );
    }

    // 2. RATE LIMITING - 5 attempts per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      identifier: clientIP,
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      const response = apiRateLimit();
      response.headers.set('Retry-After', retryAfter.toString());
      response.headers.set('X-RateLimit-Limit', '5');
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
      return response;
    }

    const body = await request.json();

    // Validate input
    const validation = validate(adminLoginSchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    const { email, password } = validation.data;

    if (!prisma) {
      logger.error('Prisma client is null - DATABASE_URL may not be set');
      return apiError(
        'Database connection unavailable. Please check environment variables.',
        500,
        'Visit /api/admin/auth/test-db for detailed diagnostics'
      );
    }

    // Find user - normalize email for lookup (case-insensitive)
    // Email is stored exactly as provided, but we lookup case-insensitively
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedEmail = email.trim();
    let user;
    try {
      // Try exact match first (for case-sensitive storage like Admin@extremedeptkidz.com)
      user = await prisma.adminUser.findUnique({
        where: { email: trimmedEmail },
      });
      
      // If not found with exact match, try case-insensitive lookup
      // This handles both Admin@extremedeptkidz.com and admin@extremedeptkidz.com
      if (!user) {
        // Get all admin users and find case-insensitive match
        const allAdmins = await prisma.adminUser.findMany({
          where: { isActive: true },
        });
        user = allAdmins.find(u => u.email.toLowerCase() === normalizedEmail) || null;
      }
    } catch (dbError) {
      logger.error('Database query error:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error';
      
      // Check for specific Prisma connection errors
      const isConnectionError = 
        errorMessage.includes('Can\'t reach database server') ||
        errorMessage.includes('Authentication failed') ||
        errorMessage.includes('Connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('P1001') || // Prisma connection error code
        errorMessage.includes('P1000');   // Prisma authentication error code
      
      return apiError(
        isConnectionError 
          ? 'Unable to connect to database. Please check your database configuration in Vercel environment variables.'
          : 'Database query failed. Please try again.',
        500,
        process.env.NODE_ENV === 'development' ? errorMessage : undefined
      );
    }

    if (!user) {
      logger.log(`Login attempt failed: User not found for email ${normalizedEmail}`);
      // Don't reveal if user exists (security best practice)
      return apiUnauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      return apiError('Account is inactive', 403);
    }

    // Verify password - trim to avoid whitespace issues
    const trimmedPassword = password.trim();
    
    // Check if password hash exists
    if (!user.passwordHash) {
      logger.error('[Login] ❌ No password hash found for user:', user.email);
      return apiUnauthorized('Invalid email or password');
    }
    
    let isValid = false;
    try {
      isValid = await verifyPassword(trimmedPassword, user.passwordHash);
    } catch (verifyError) {
      logger.error('[Login] ❌ Password verification error:', verifyError);
      return apiError(
        'Password verification failed',
        500,
        verifyError instanceof Error ? verifyError.message : 'Unknown error'
      );
    }
    
    if (!isValid) {
      logger.log(`[Login] ❌ Invalid password for user ${user.email}`);
      
      // Track failed attempts
      const attempts = (failedAttempts.get(clientIP) || 0) + 1;
      failedAttempts.set(clientIP, attempts);

      // Block after 10 failed attempts
      if (attempts >= 10) {
        logger.error('🚨 Account locked due to too many failed attempts:', user.email);
        return apiError(
          'Account temporarily locked due to too many failed attempts',
          423
        );
      }

      // Timing attack prevention - delay response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return apiUnauthorized('Invalid email or password');
    }

    // Clear failed attempts on successful login
    failedAttempts.delete(clientIP);
    
    logger.log(`[Login] ✅ Password verified successfully for user ${user.email}`);

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
    // Note: Must match the format expected by admin-auth-store.ts
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '5');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

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
    logger.error('Login error:', error);
    return apiError(
      'Login failed',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
