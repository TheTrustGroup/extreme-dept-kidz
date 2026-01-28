import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get('admin-token')?.value;
  const path = req.nextUrl.pathname;
  const logoutParam = req.nextUrl.searchParams.get('logout');

  // If logout parameter is present, allow access to login page even with token
  // This handles the logout flow where cookie might not be cleared yet
  if (path === '/admin/login' && logoutParam === 'true') {
    return NextResponse.next();
  }

  if (path.startsWith('/admin') && !token && path !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  // Don't redirect to /admin if user is logging out
  if (path === '/admin/login' && token && !logoutParam) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}
