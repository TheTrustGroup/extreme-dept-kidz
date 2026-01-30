import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { withCors } from '@/lib/utils/cors';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIP } from '@/lib/auth/rate-limit-redis';
import { generateCSRFToken, setCSRFTokenCookie } from '@/lib/auth/csrf';
import { detectBot } from '@/lib/security/bot-detector';
import { apiSuccess, apiError, apiValidationError, apiRateLimit, apiUnauthorized } from '@/lib/utils/api-response';
import { adminLoginSchema, validate } from '@/lib/validation/schemas';
import { logger } from '@/lib/utils/logger';
import { logActivity, ActivityActions } from '@/lib/services/admin/activity.service';
import { retryPrismaQuery } from '@/lib/utils/retry';

export const dynamic = 'force-dynamic';

// Track failed login attempts
const failedAttempts = new Map<string, number>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Extract request ID for tracking
  const requestId = request.headers.get('X-Request-ID') || undefined;
  
  try {
    // 0. ENVIRONMENT CHECK - Fail fast if critical env vars are missing
    // Check DATABASE_URL first
    if (!process.env.DATABASE_URL) {
      logger.error('[Login] ❌ DATABASE_URL is not set');
      return withCors(request, apiError(
        'Database configuration error. DATABASE_URL environment variable is not set.',
        500,
        'Please check Vercel environment variables and ensure DATABASE_URL is configured.',
        'MISSING_DATABASE_URL',
        requestId
      ));
    }

    // Check JWT_SECRET - CRITICAL for authentication
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('[Login] ❌ JWT_SECRET is not set');
      return withCors(request, apiError(
        'Authentication configuration error: JWT_SECRET environment variable is not set. Please set JWT_SECRET in your environment variables.',
        500,
        'Set JWT_SECRET in Vercel environment variables (must be at least 32 characters).',
        'MISSING_JWT_SECRET',
        requestId
      ));
    }
    
    if (jwtSecret.length < 32) {
      logger.error('[Login] ❌ JWT_SECRET is too short', {
        length: jwtSecret.length,
        requiredLength: 32,
        // Don't log the actual secret, just first/last chars for verification
        preview: jwtSecret.length > 0 ? `${jwtSecret[0]}...${jwtSecret[jwtSecret.length - 1]}` : 'empty',
      });
      return withCors(request, apiError(
        'Authentication configuration error: JWT_SECRET must be at least 32 characters long.',
        500,
        `Current JWT_SECRET length: ${jwtSecret.length} (required: 32+). Update JWT_SECRET in Vercel environment variables.`,
        'INVALID_JWT_SECRET',
        requestId
      ));
    }

    // 1. BOT DETECTION - Only block obvious bots (score > 80)
    // Reduced threshold to prevent false positives
    const botDetection = detectBot(request);
    
    if (botDetection.isBot && botDetection.score > 80) {
      logger.warn('🤖 Bot detected on login:', botDetection.reasons);
      return withCors(request, apiError(
        'Suspicious activity detected',
        403,
        'Request blocked by security system. If you believe this is an error, please contact support.',
        undefined,
        requestId
      ));
    }
    
    // Log but don't block for moderate bot scores (for debugging)
    if (botDetection.score > 50 && botDetection.score <= 80) {
      logger.log(`[Login] ⚠️ Moderate bot score (${botDetection.score}):`, botDetection.reasons);
    }

    // 2. RATE LIMITING - 5 attempts per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      identifier: clientIP,
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      const response = apiRateLimit(requestId);
      response.headers.set('Retry-After', retryAfter.toString());
      response.headers.set('X-RateLimit-Limit', '5');
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
      return withCors(request, response);
    }

    // Parse request body with error handling
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      logger.error('[Login] ❌ Failed to parse request body:', parseError);
      return withCors(request, apiError(
        'Invalid request format',
        400,
        'Request body must be valid JSON',
        'INVALID_JSON',
        requestId
      ));
    }

    // Validate input
    const validation = validate(adminLoginSchema, body);
    if (!validation.success) {
      return withCors(request, apiValidationError(validation.errors));
    }

    const { email, password } = validation.data;

    // Ensure DB connection is ready (Vercel cold start) - lazy init if needed
    try {
      const { initializeDatabase } = await import('@/lib/db');
      await initializeDatabase();
    } catch (initError) {
      logger.warn('[Login] DB init check failed (will try query anyway):', initError instanceof Error ? initError.message : 'Unknown');
      // Continue - Prisma will attempt connection on first query
    }

    // Check if Prisma client is available
    if (!prisma) {
      logger.error('[Login] ❌ Prisma client is not available');
      return withCors(request, apiError(
        'Database not available',
        500,
        'Database connection failed. Please check DATABASE_URL configuration.',
        undefined,
        requestId
      ));
    }

    // Note: Prisma manages connections automatically - no need to call $connect() explicitly
    // The first query will establish the connection automatically

    // Find user - normalize email for lookup (case-insensitive)
    // Email is stored exactly as provided, but we lookup case-insensitively
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedEmail = email.trim();
    let user;
    
    try {
      // Use retryPrismaQuery for better timeout and retry handling
      // Try exact match first (for case-sensitive storage like Admin@extremedeptkidz.com)
      // We already checked prisma is not null above, so use non-null assertion
      logger.log(`[Login] 🔍 Looking up user with email: ${trimmedEmail}`, { requestId });
      
      // Try direct query first (without retry wrapper) to see actual error
      try {
        user = await prisma!.adminUser.findUnique({
          where: { email: trimmedEmail },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            role: true,
            isActive: true,
            tokenVersion: true,
          },
        });
        logger.log(`[Login] 📧 Exact match result: ${user ? 'found' : 'not found'}`, { requestId });
      } catch (directError) {
        // If direct query fails, wrap in retry logic
        logger.warn(`[Login] Direct query failed, using retry:`, directError instanceof Error ? directError.message : 'Unknown');
        user = await retryPrismaQuery(
          () => prisma!.adminUser.findUnique({
            where: { email: trimmedEmail },
            select: {
              id: true,
              email: true,
              passwordHash: true,
              role: true,
              isActive: true,
              tokenVersion: true,
            },
          }),
          { 
            timeoutMs: 10000, // Increased to 10 seconds for cold starts
            maxRetries: 3, // Reduced retries since connection is working
            initialDelayMs: 200, // Shorter delay
          }
        );
        logger.log(`[Login] 📧 Exact match result (after retry): ${user ? 'found' : 'not found'}`, { requestId });
      }
      
      // If not found with exact match, try case-insensitive lookup
      // This handles both Admin@extremedeptkidz.com and admin@extremedeptkidz.com
      if (!user) {
        logger.log(`[Login] 🔍 Trying case-insensitive lookup for: ${normalizedEmail}`, { requestId });
        try {
          // Get all admin users and find case-insensitive match
          const allAdmins = await prisma!.adminUser.findMany({
            where: { isActive: true },
            select: {
              id: true,
              email: true,
              passwordHash: true,
              role: true,
              isActive: true,
              tokenVersion: true,
            },
          });
          user = allAdmins.find(u => u.email.toLowerCase() === normalizedEmail) || null;
          logger.log(`[Login] 📧 Case-insensitive match result: ${user ? 'found' : 'not found'}`, { requestId });
        } catch (caseError) {
          logger.warn(`[Login] Case-insensitive lookup failed:`, caseError instanceof Error ? caseError.message : 'Unknown');
          // Try with retry wrapper
          user = await retryPrismaQuery(
            () => prisma!.adminUser.findMany({
              where: { isActive: true },
              select: {
                id: true,
                email: true,
                passwordHash: true,
                role: true,
                isActive: true,
                tokenVersion: true,
              },
            }).then(admins => admins.find(u => u.email.toLowerCase() === normalizedEmail) || null),
            { 
              timeoutMs: 10000,
              maxRetries: 3,
              initialDelayMs: 200,
            }
          );
          logger.log(`[Login] 📧 Case-insensitive match result (after retry): ${user ? 'found' : 'not found'}`, { requestId });
        }
      }
    } catch (dbError) {
      const error = dbError instanceof Error ? dbError : new Error('Unknown database error');
      const errorMessage = error.message;
      const errorName = error.name;
      const errorCode = (error as any).code;
      const errorMeta = (error as any).meta;
      
      // Log full error details for debugging
      logger.error(`[Login] ❌ Database query failed:`, {
        name: errorName,
        message: errorMessage,
        code: errorCode,
        meta: errorMeta,
        stack: error.stack,
        email: trimmedEmail,
        normalizedEmail,
        requestId,
        prismaAvailable: !!prisma,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      });
      
      // Check for specific Prisma connection errors (P1000 auth, P1001 unreachable, P1002 timeout)
      // Be more specific - don't treat all errors as connection errors
      const isConnectionError = 
        errorCode === 'P1000' || // Prisma auth failed
        errorCode === 'P1001' || // Prisma can't reach server
        errorCode === 'P1002' ||  // Prisma connection timeout
        (errorName === 'PrismaClientInitializationError' && (
          errorMessage.includes('Can\'t reach database server') ||
          errorMessage.includes('Authentication failed')
        )) ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ENOTFOUND');
      
      // Check if it's a query error (not connection error)
      const isQueryError = 
        errorCode === 'P2002' || // Unique constraint violation
        errorCode === 'P2025' || // Record not found
        errorCode === 'P2014' || // Required relation missing
        errorMessage.includes('Record to update not found') ||
        errorMessage.includes('Unique constraint') ||
        (errorName === 'PrismaClientKnownRequestError' && !isConnectionError);
      
      const connectionHint = isConnectionError
        ? 'Use the Supabase Transaction pooler (port 6543) in Vercel, not the direct URL (5432). In Supabase: Settings → Database → Connection string → Transaction.'
        : undefined;

      // Include diagnostic URL in error response for easier troubleshooting
      const diagnosticUrl = `${request.nextUrl.origin}/api/admin/auth/test-db`;
      
      // Provide more specific error messages based on error type
      let userMessage = 'Database query failed. Please try again.';
      if (isConnectionError) {
        userMessage = 'Unable to connect to database. Use the Supabase connection pooler (port 6543) in Vercel DATABASE_URL — see Supabase → Settings → Database → Transaction.';
      } else if (isQueryError) {
        userMessage = 'Database query error. Please check the request and try again.';
      }
      
      // Include error code in details for production debugging
      const errorDetails = errorCode 
        ? `${errorName} (${errorCode}): ${errorMessage}`
        : `${errorName}: ${errorMessage}`;
      
      try {
        return withCors(request, apiError(
          userMessage,
          500,
          // Always include error code/details for debugging (not sensitive)
          errorDetails + (errorMeta ? ` | Meta: ${JSON.stringify(errorMeta)}` : ''),
          errorCode || 'DATABASE_ERROR',
          requestId
        ));
      } catch (corsError) {
        // If withCors fails, return error directly
        logger.error('[Login] ❌ Failed to wrap response with CORS:', corsError);
        return apiError(
          userMessage,
          500,
          errorDetails,
          errorCode || 'DATABASE_ERROR',
          requestId
        );
      }
    }

    if (!user) {
      logger.log(`Login attempt failed: User not found for email ${normalizedEmail}`);
      // Don't reveal if user exists (security best practice)
      return withCors(request, apiUnauthorized('Invalid email or password', requestId));
    }

    if (!user.isActive) {
      return withCors(request, apiError('Account is inactive', 403, undefined, undefined, requestId));
    }

    // Verify password - trim to avoid whitespace issues
    const trimmedPassword = password.trim();
    
    // Check if password hash exists
    if (!user.passwordHash) {
      logger.error('[Login] ❌ No password hash found for user:', user.email);
      return withCors(request, apiUnauthorized('Invalid email or password', requestId));
    }
    
    let isValid = false;
    try {
      isValid = await verifyPassword(trimmedPassword, user.passwordHash);
    } catch (verifyError) {
      logger.error('[Login] ❌ Password verification error:', verifyError);
      return withCors(request, apiError(
        'Password verification failed',
        500,
        verifyError instanceof Error ? verifyError.message : 'Unknown error',
        undefined,
        requestId
      ));
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
        return withCors(request, apiError(
          'Account temporarily locked due to too many failed attempts',
          423,
          undefined,
          undefined,
          requestId
        ));
      }

      // Timing attack prevention - delay response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return withCors(request, apiUnauthorized('Invalid email or password', requestId));
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

    // Generate token (include tokenVersion for session invalidation)
    let token: string;
    try {
      token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion ?? 0, // Include token version for session invalidation
      });
      logger.log(`[Login] ✅ Token generated successfully for user ${user.email}`);
    } catch (tokenError) {
      logger.error('[Login] ❌ Token generation failed:', tokenError);
      const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error';
      
      // Check if it's a JWT_SECRET issue
      if (errorMessage.includes('JWT_SECRET') || errorMessage.includes('secret')) {
        return withCors(request, apiError(
          'Authentication configuration error. JWT_SECRET is not set or invalid.',
          500,
          'Please check JWT_SECRET in Vercel environment variables. It must be at least 32 characters long.'
        ));
      }
      
      return withCors(request, apiError(
        'Token generation failed',
        500,
        errorMessage
      ));
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
      const hostname = request.nextUrl?.hostname || '';
      const isProductionHost = isProduction && hostname && hostname !== 'localhost' && !hostname.endsWith('.local');
      const cookieOptions: Parameters<NextResponse['cookies']['set']>[2] = {
        httpOnly: true, // Prevents XSS attacks
        secure: isProduction, // HTTPS only in production
        sameSite: 'lax', // Allow cookie on same-site top-level navigations (fixes post-login redirect)
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/', // Available site-wide
      };
      // In production, set domain so cookie is sent for both www and non-www
      if (isProductionHost && hostname) {
        const rootDomain = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
        cookieOptions.domain = rootDomain ? '.' + rootDomain : undefined;
      }
      response.cookies.set('admin-token', token, cookieOptions);
      
      // Generate and set CSRF token cookie
      const csrfToken = generateCSRFToken();
      setCSRFTokenCookie(response, csrfToken);
      
      logger.log(`[Login] ✅ Cookie set for user ${user.email} (httpOnly: true, secure: ${isProduction}, sameSite: lax${cookieOptions.domain ? `, domain: ${cookieOptions.domain}` : ''})`);
      logger.log(`[Login] ✅ CSRF token generated and set`);
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

    try {
      return withCors(request, response);
    } catch (corsError) {
      logger.error('[Login] ❌ Failed to wrap success response with CORS:', corsError);
      // Return response without CORS if wrapping fails
      return response;
    }
  } catch (error) {
    logger.error('[Login] ❌ Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorCode = (error as any).code;
    
    // Log full error details for debugging
    logger.error('[Login] ❌ Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName,
      code: errorCode,
      type: typeof error,
      requestId,
    });
    
    // Check if it's a known configuration error
    const isConfigError = 
      errorMessage.includes('DATABASE_URL') ||
      errorMessage.includes('JWT_SECRET') ||
      errorMessage.includes('Environment variable') ||
      errorMessage.includes('configuration') ||
      errorMessage.includes('Prisma') ||
      errorMessage.includes('database') ||
      errorMessage.includes('connection');
    
    // Check for JSON parsing errors
    const isJsonError = 
      errorMessage.includes('JSON') ||
      errorMessage.includes('Unexpected token') ||
      errorMessage.includes('parse');
    
    // Check for network/connection errors
    const isNetworkError = 
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ETIMEDOUT');
    
    // In development, always show the actual error
    // In production, show detailed error for config issues, generic for others
    const shouldShowDetails = process.env.NODE_ENV === 'development' || isConfigError || isJsonError || isNetworkError;
    
    // Provide more helpful error messages
    let userFriendlyError = 'Login failed. Please try again or contact support if the issue persists.';
    if (isConfigError) {
      userFriendlyError = errorMessage;
    } else if (isJsonError) {
      userFriendlyError = 'Invalid request format. Please check your input.';
    } else if (isNetworkError) {
      userFriendlyError = 'Unable to connect to server. Please check your internet connection.';
    }
    
    // Build error details
    const errorDetails = errorCode 
      ? `${errorName} (${errorCode}): ${errorMessage}`
      : `${errorName}: ${errorMessage}`;
    
    try {
      return withCors(request, apiError(
        userFriendlyError,
        500,
        shouldShowDetails ? errorDetails : undefined,
        isConfigError ? 'CONFIG_ERROR' : isJsonError ? 'JSON_ERROR' : isNetworkError ? 'NETWORK_ERROR' : 'INTERNAL_ERROR',
        requestId
      ));
    } catch (corsError) {
      // If withCors fails, return error directly
      logger.error('[Login] ❌ Failed to wrap error response with CORS:', corsError);
      return apiError(
        userFriendlyError,
        500,
        shouldShowDetails ? errorDetails : undefined,
        isConfigError ? 'CONFIG_ERROR' : isJsonError ? 'JSON_ERROR' : isNetworkError ? 'NETWORK_ERROR' : 'INTERNAL_ERROR',
        requestId
      );
    }
  }
}
