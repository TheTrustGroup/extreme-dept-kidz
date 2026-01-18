import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from '@/lib/auth/jwt';
import { detectBot } from '@/lib/security/bot-detector';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // CRITICAL: Identify diagnostic/debug endpoints FIRST - they bypass all security checks
  // These endpoints have their own security and are needed for troubleshooting
  const isDiagnosticEndpoint = pathname.includes('/diagnose') || 
                                pathname.includes('/test-db') || 
                                pathname.includes('/test-login') ||
                                pathname.includes('/debug-login') ||
                                pathname.includes('/test') ||
                                pathname.includes('/verify-password');

  // 1. SECURITY HEADERS (all requests)
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // 2. BOT PROTECTION (all API routes except webhooks and diagnostic endpoints)
  if (pathname.startsWith("/api") && 
      !pathname.includes("/webhook") && 
      !pathname.includes("/callback") &&
      !isDiagnosticEndpoint) {
    const botDetection = detectBot(request);
    
    if (botDetection.isBot && botDetection.score > 70) {
      console.warn('🤖 High-confidence bot blocked:', pathname, botDetection.reasons);
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
  }

  // 3. RATE LIMITING (API routes, but skip diagnostic endpoints and login endpoints)
  // Login endpoints have their own rate limiting logic, so we skip them here to avoid double-limiting
  const isLoginEndpoint = pathname.includes("/login") || pathname.includes("/auth/login");
  
  if (pathname.startsWith("/api") && !isDiagnosticEndpoint && !isLoginEndpoint) {
    let rateLimitConfig = RATE_LIMITS.PUBLIC_READ;

    // Apply stricter limits based on endpoint
    if (pathname.includes("/upload")) {
      rateLimitConfig = RATE_LIMITS.FILE_UPLOAD;
    } else if (pathname.includes("/payment")) {
      rateLimitConfig = RATE_LIMITS.PAYMENT;
    } else if (pathname.startsWith("/api/admin") && request.method !== "GET") {
      rateLimitConfig = RATE_LIMITS.ADMIN_WRITE;
    }

    const rateLimit = checkRateLimit(request, rateLimitConfig);
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }
  }

  // 4. ADMIN ROUTE PROTECTION
  // Allow access to login, forgot-password, and reset-password pages without auth
  const publicAdminRoutes = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
  const isPublicAdminRoute = publicAdminRoutes.some(route => pathname.startsWith(route));
  
  if (pathname.startsWith("/admin") && !isPublicAdminRoute) {
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const payload = verifyToken(token);
      if (!payload) {
        console.warn("🚫 Invalid admin token in middleware - redirecting to login");
        // Clear the invalid cookie
        const response = NextResponse.redirect(new URL("/admin/login", request.url));
        response.cookies.delete('admin-token');
        return response;
      }
    } catch (error) {
      console.warn("🚫 Token verification error in middleware:", error);
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete('admin-token');
      return response;
    }
  }

  // 5. ADMIN API PROTECTION
  // Diagnostic endpoints and login endpoints are already excluded (checked at top of function)
  // Login endpoint doesn't require authentication (it's the authentication endpoint itself)
  if (pathname.startsWith("/api/admin") && !isDiagnosticEndpoint && !isLoginEndpoint) {
    const token = request.cookies.get("admin-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const payload = verifyToken(token);
      if (!payload) {
        console.warn("🚫 Invalid admin token in API middleware");
        const response = NextResponse.json(
          { 
            error: "Invalid or expired token",
            message: "Please log in again. If this persists, check JWT_SECRET in environment variables."
          },
          { status: 401 }
        );
        // Clear invalid cookie
        response.cookies.delete('admin-token');
        return response;
      }
    } catch (error) {
      console.error("🚫 Token verification error in API middleware:", error);
      const response = NextResponse.json(
        { 
          error: "Invalid or expired token",
          message: "Token verification failed. Please log in again."
        },
        { status: 401 }
      );
      response.cookies.delete('admin-token');
      return response;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};
