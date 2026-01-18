import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit';
import { detectBot } from '@/lib/security/bot-detector';
import { apiSuccess, apiError, apiValidationError, apiRateLimit, apiUnauthorized } from '@/lib/utils/api-response';
import { adminLoginSchema, validate } from '@/lib/validation/schemas';
import { logger } from '@/lib/utils/logger';
import { logActivity, ActivityActions } from '@/lib/services/admin/activity.service';

export const dynamic = 'force-dynamic';

// Track failed login attempts
const failedAttempts = new Map<string, number>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 0. ENVIRONMENT CHECK - Fail fast if critical env vars are missing
    if (!process.env.DATABASE_URL) {
      logger.error('[Login] ❌ DATABASE_URL is not set');
      return apiError(
        'Database configuration error. DATABASE_URL environment variable is not set.',
        500,
        'Please check Vercel environment variables and ensure DATABASE_URL is configured.',
        'MISSING_DATABASE_URL'
      );
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      logger.error('[Login] ❌ JWT_SECRET is missing or too short', {
        hasSecret: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET?.length || 0,
      });
      return apiError(
        'Authentication configuration error. JWT_SECRET environment variable is missing or invalid (must be at least 32 characters).',
        500,
        'Please check Vercel environment variables and ensure JWT_SECRET is set to a secure value (32+ characters).',
        'MISSING_JWT_SECRET'
      );
    }

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
      
      // Log failed login attempt
      await logActivity({
        adminUserId: user.id,
        action: ActivityActions.LOGIN_FAILED,
        details: {
          email: user.email,
          reason: 'Invalid password',
        },
      }, request);
      
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

    // Update last login (non-blocking - don't fail login if this fails)
    if (prisma) {
      try {
        await prisma.adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      } catch (updateError) {
        // Log but don't fail login if lastLoginAt update fails
        logger.warn('[Login] ⚠️ Failed to update lastLoginAt:', updateError);
      }
    }

    // Generate token
    let token: string;
    try {
      token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      logger.log(`[Login] ✅ Token generated successfully for user ${user.email}`);
    } catch (tokenError) {
      logger.error('[Login] ❌ Token generation failed:', tokenError);
      const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error';
      
      // Check if it's a JWT_SECRET issue
      if (errorMessage.includes('JWT_SECRET') || errorMessage.includes('secret')) {
        return apiError(
          'Authentication configuration error. JWT_SECRET is not set or invalid.',
          500,
          'Please check JWT_SECRET in Vercel environment variables. It must be at least 32 characters long.'
        );
      }
      
      return apiError(
        'Token generation failed',
        500,
        errorMessage
      );
    }

    // Create response - MUST NOT REDIRECT
    // Return simple success response
    let response: NextResponse;
    try {
      response = NextResponse.json({ success: true });
      logger.log('[Login] ✅ Response JSON created successfully');
    } catch (jsonError) {
      logger.error('[Login] ❌ Failed to create JSON response:', jsonError);
      throw new Error(`Failed to create response: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
    }
    
    // CRITICAL: Add cache-busting headers to prevent any caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Add rate limit headers (safe access with fallbacks)
    try {
      response.headers.set('X-RateLimit-Limit', '5');
      if (rateLimit && typeof rateLimit.remaining === 'number') {
        response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
      }
      if (rateLimit && rateLimit.resetTime) {
        response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
      }
    } catch (headerError) {
      logger.warn('[Login] ⚠️ Failed to set rate limit headers:', headerError);
      // Don't fail login if headers fail
    }
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Set cookie for middleware authentication
    // CRITICAL: Cookie must be set correctly for authentication to work
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      response.cookies.set('admin-token', token, {
        httpOnly: true, // Prevents XSS attacks
        secure: isProduction, // HTTPS only in production
        sameSite: 'lax', // Works for same-site requests, allows top-level navigation
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/', // Available site-wide
      });
      logger.log(`[Login] ✅ Cookie set for user ${user.email} (httpOnly: true, secure: ${isProduction}, sameSite: lax)`);
    } catch (cookieError) {
      logger.error('[Login] ❌ Failed to set cookie:', cookieError);
      // Don't fail login if cookie setting fails - token is still in response body
      logger.warn('[Login] ⚠️ Cookie not set, but token is in response body');
    }

    // Log successful login (non-blocking - don't fail login if this fails)
    try {
      await logActivity({
        adminUserId: user.id,
        action: ActivityActions.LOGIN,
        details: {
          email: user.email,
          role: user.role,
        },
      }, request);
    } catch (activityError) {
      // Log but don't fail login if activity logging fails
      logger.warn('[Login] ⚠️ Failed to log activity:', activityError);
    }

    return response;
  } catch (error) {
    logger.error('[Login] ❌ Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log full error details for debugging
    logger.error('[Login] ❌ Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : undefined,
    });
    
    // Check if it's a known configuration error
    const isConfigError = 
      errorMessage.includes('DATABASE_URL') ||
      errorMessage.includes('JWT_SECRET') ||
      errorMessage.includes('Environment variable') ||
      errorMessage.includes('configuration');
    
    return apiError(
      isConfigError 
        ? errorMessage 
        : 'Login failed. Please try again or contact support if the issue persists.',
      500,
      process.env.NODE_ENV === 'development' ? errorMessage : (isConfigError ? errorMessage : undefined)
    );
  }
}
