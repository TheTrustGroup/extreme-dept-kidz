import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get('admin-token')?.value;
  const path = req.nextUrl.pathname;

  if (path.startsWith('/admin') && !token && path !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  if (path === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}
