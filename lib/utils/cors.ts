import type { NextRequest, NextResponse } from 'next/server';

/** CORS origin for warehouse app (warehouse.extremedeptkidz.com) */
export const WAREHOUSE_ORIGIN = 'https://warehouse.extremedeptkidz.com';

/**
 * Add CORS headers to a response when the request Origin is the warehouse app.
 * Use in API routes that are called cross-origin from warehouse.extremedeptkidz.com.
 */
export function withCors(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get('Origin');
  if (origin === WAREHOUSE_ORIGIN) {
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
