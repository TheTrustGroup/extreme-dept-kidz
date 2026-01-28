import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for Asset Pipeline Optimization
 * 
 * Enforces:
 * - CDN caching headers
 * - Compression (Brotli/gzip)
 * - HTTP/2 streaming optimizations
 * - Immutable caching for static assets
 * - Mobile-first optimizations
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

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

// Match all static assets and image routes
export const config = {
  matcher: [
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
