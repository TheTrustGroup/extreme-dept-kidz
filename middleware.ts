import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** CORS: allowed origins (main site, www, warehouse, dev) */
const ALLOWED_ORIGINS = new Set([
  'https://extremedeptkidz.com',
  'https://www.extremedeptkidz.com',
  'https://warehouse.extremedeptkidz.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

/** Derive effective origin from request when Origin header is missing (same-origin / RSC fetches) */
function getEffectiveOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('Origin');
  if (origin && ALLOWED_ORIGINS.has(origin)) return origin;
  try {
    const url = request.nextUrl;
    const derived = `${url.protocol}//${url.host}`;
    if (ALLOWED_ORIGINS.has(derived)) return derived;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return derived;
  } catch {
    /* ignore */
  }
  return null;
}

/** CORS headers when origin is allowed (credentials: true) */
function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Generate a unique request ID for tracking
 * Uses Web Crypto API (available in Edge Runtime)
 */
function generateRequestId(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Middleware for Asset Pipeline Optimization
 * 
 * Enforces:
 * - Request ID tracking for all requests
 * - CORS for warehouse.extremedeptkidz.com (admin API login)
 * - CDN caching headers
 * - Compression (Brotli/gzip)
 * - HTTP/2 streaming optimizations
 * - Immutable caching for static assets
 * - Mobile-first optimizations
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('Origin') || '';
  
  // Generate or use existing request ID
  const requestId = request.headers.get('X-Request-ID') || generateRequestId();

  // CORS: allow main site, www, warehouse, and dev to call API (fixes "access control checks" on /api/products)
  // Special handling for public diagnostic endpoints (no auth required)
  const isPublicDiagnostic = pathname === '/api/admin/auth/test-db' || pathname === '/api/health';
  const isApi =
    pathname === '/api/admin/auth/login' ||
    pathname === '/admin/api/login' ||
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/admin/api/') ||
    pathname === '/api/orders' ||
    pathname.startsWith('/api/orders/') ||
    pathname === '/api/products' ||
    pathname.startsWith('/api/products/');
  const effectiveOrigin = getEffectiveOrigin(request);
  const isAllowedOrigin = !!effectiveOrigin;
  
  // Public diagnostic endpoints: allow from anywhere (no CORS restrictions)
  if (isPublicDiagnostic) {
    const response = NextResponse.next();
    response.headers.set('X-Request-ID', requestId);
    // Allow CORS for diagnostic endpoints
    if (origin) {
      Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    } else {
      // No origin (curl, etc.) - allow anyway for diagnostics
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }
    return response;
  }
  
  if (isApi && isAllowedOrigin && effectiveOrigin) {
    if (request.method === 'OPTIONS') {
      const headers = corsHeaders(effectiveOrigin);
      headers['X-Request-ID'] = requestId;
      return new NextResponse(null, {
        status: 204,
        headers,
      });
    }
    const response = NextResponse.next();
    Object.entries(corsHeaders(effectiveOrigin)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response.headers.set('X-Request-ID', requestId);
    return response;
  }

  const response = NextResponse.next();
  
  // Add request ID to response headers for tracking
  response.headers.set('X-Request-ID', requestId);
  
  // Note: Cannot modify request headers in middleware, but API routes can read X-Request-ID
  // from response headers or generate their own if needed

  // CRITICAL FIX: Enhanced CDN caching for static assets
  // Images, fonts, and static files get immutable cache headers
  if (
    pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico|woff|woff2|ttf|eot)$/i) ||
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/uploads/')
  ) {
    // Immutable caching: 1 year for static assets
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    
    // CDN-specific cache headers
    response.headers.set(
      'CDN-Cache-Control',
      'public, max-age=31536000, immutable'
    );
    response.headers.set(
      'Vercel-CDN-Cache-Control',
      'public, max-age=31536000, immutable'
    );
    
    // Compression headers (Brotli handled by CDN automatically)
    response.headers.set('Accept-Encoding', 'br, gzip, deflate');
    
    // HTTP/2 Server Push hint (Vercel/CDN handles automatically)
    // Content-Type for proper MIME type handling
    if (pathname.match(/\.(jpg|jpeg)$/i)) {
      response.headers.set('Content-Type', 'image/jpeg');
    } else if (pathname.match(/\.png$/i)) {
      response.headers.set('Content-Type', 'image/png');
    } else if (pathname.match(/\.webp$/i)) {
      response.headers.set('Content-Type', 'image/webp');
    } else if (pathname.match(/\.avif$/i)) {
      response.headers.set('Content-Type', 'image/avif');
    }
  }

  // CRITICAL FIX: Optimize Next.js Image API responses
  if (pathname.startsWith('/_next/image')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    response.headers.set(
      'CDN-Cache-Control',
      'public, max-age=31536000, immutable'
    );
    response.headers.set(
      'Vercel-CDN-Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // CRITICAL FIX: Mobile-first optimization headers
  // Add Vary header for responsive content
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  
  if (isMobile) {
    // Mobile-specific optimizations
    response.headers.set('X-Device-Type', 'mobile');
  }

  // CRITICAL FIX: HTTP/2 Server Push optimization
  // Vary header for content negotiation (CDN handles HTTP/2 push)
  response.headers.set('Vary', 'Accept-Encoding, User-Agent');

  return response;
}

// Match all static assets and image routes, plus admin API for CORS
export const config = {
  matcher: [
    // CORS for warehouse: admin API, orders, public products
    '/api/admin/:path*',
    '/admin/api/:path*',
    '/api/orders',
    '/api/orders/:path*',
    '/api/products',
    '/api/products/:path*',
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    // Also match static assets explicitly
    '/uploads/:path*',
    '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf|eot)',
  ],
};
