import type { NextRequest, NextResponse } from 'next/server';

/** CORS origin for warehouse app (warehouse.extremedeptkidz.com) */
export const WAREHOUSE_ORIGIN = 'https://warehouse.extremedeptkidz.com';

/** Allowed origins for CORS (main site + www + warehouse + dev) */
const ALLOWED_ORIGINS = new Set([
  'https://extremedeptkidz.com',
  'https://www.extremedeptkidz.com',
  WAREHOUSE_ORIGIN,
  'http://localhost:3000',
  'http://localhost:3001', // warehouse app when run locally
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
]);

/** Known production hostnames → canonical origin (for when request.url has internal/proxy host) */
const KNOWN_HOSTNAMES: Record<string, string> = {
  'extremedeptkidz.com': 'https://extremedeptkidz.com',
  'www.extremedeptkidz.com': 'https://www.extremedeptkidz.com',
  'warehouse.extremedeptkidz.com': WAREHOUSE_ORIGIN,
};

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
 * Derive request origin from URL, Referer, or known hostnames when Origin header is missing.
 * Ensures API responses always have a valid CORS origin so "access control checks" never fail
 * (e.g. same-origin fetches, RSC payloads, or when request.url has an internal/proxy host).
 */
function getEffectiveOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('Origin');
  if (origin && isAllowedOrigin(origin)) return origin;

  try {
    const url = new URL(request.url);
    const derived = `${url.protocol}//${url.host}`;
    if (ALLOWED_ORIGINS.has(derived)) return derived;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return `${url.protocol}//${url.host}`;
    }
    const knownOrigin = KNOWN_HOSTNAMES[url.hostname];
    if (knownOrigin) return knownOrigin;
  } catch {
    /* ignore */
  }

  const referer = request.headers.get('Referer');
  if (referer) {
    try {
      const refUrl = new URL(referer);
      const refOrigin = `${refUrl.protocol}//${refUrl.host}`;
      if (ALLOWED_ORIGINS.has(refOrigin)) return refOrigin;
      const knownOrigin = KNOWN_HOSTNAMES[refUrl.hostname];
      if (knownOrigin) return knownOrigin;
    } catch {
      /* ignore */
    }
  }

  return null;
}

/**
 * Add CORS headers so the main site and warehouse can call API routes.
 * Always sets CORS when we can derive an allowed origin (fixes "access control checks"
 * when Origin header is missing on same-origin or RSC fetches).
 */
export function withCors(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = getEffectiveOrigin(request);
  if (origin) {
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
