import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Check for admin authentication in headers (we'll set this via API)
    // For now, we'll handle auth in the layout/component level
    // This middleware can be enhanced later with proper session management
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
