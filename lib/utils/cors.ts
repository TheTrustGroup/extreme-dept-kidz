import type { NextRequest, NextResponse } from 'next/server';

/** CORS origin for warehouse app (warehouse.extremedeptkidz.com) */
export const WAREHOUSE_ORIGIN = 'https://warehouse.extremedeptkidz.com';

/** Allowed origins for CORS (main site + www + warehouse + dev) */
const ALLOWED_ORIGINS = new Set([
  'https://extremedeptkidz.com',
  'https://www.extremedeptkidz.com',
  WAREHOUSE_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

/** True when the request is from the warehouse app (for response-shape compatibility). */
export function isWarehouseRequest(request: { headers: Headers }): boolean {
  return request.headers.get('Origin') === WAREHOUSE_ORIGIN;
}

/**
 * Returns true if the request Origin is allowed for CORS.
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.has(origin);
}

/**
 * Add CORS headers so the main site and warehouse can call API routes.
 * Fixes "Fetch API cannot load ... due to access control checks" when
 * fetching /api/products from extremedeptkidz.com or www.
 */
export function withCors(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get('Origin');
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Authorization'
    );
  }
  return response;
}
