/**
 * Centralized Cache Constants
 *
 * Single source of truth for ISR, CDN, and API cache TTLs so list/detail/API
 * stay in sync and admin mutations invalidate consistently.
 */

/** ISR revalidate (seconds) for product/catalog pages and APIs — short so admin changes appear quickly */
export const CACHE_REVALIDATE_PRODUCTS = 10;

/** CDN s-maxage (seconds) for product/collection/homepage — must match revalidate for consistency */
export const CACHE_SMAXAGE_PRODUCTS = 10;

/** Stale-while-revalidate (seconds) for product/catalog — bounded staleness */
export const CACHE_SWR_PRODUCTS = 59;

/** ISR revalidate for complete looks (less frequently updated) */
export const CACHE_REVALIDATE_LOOKS = 60;

/** CDN s-maxage for complete looks API */
export const CACHE_SMAXAGE_LOOKS = 60;

/** Stale-while-revalidate for complete looks */
export const CACHE_SWR_LOOKS = 300;

/** Default API cache when no explicit cache option — short to avoid surprise staleness */
export const CACHE_DEFAULT_SMAXAGE = 10;

/** Default API stale-while-revalidate */
export const CACHE_DEFAULT_SWR = 59;

/**
 * Build Cache-Control value for product/catalog (pages and API).
 * Use everywhere: next.config headers, apiSuccess for /api/products, unstable_cache revalidate.
 */
export function productCacheControl(): string {
  return `public, max-age=0, s-maxage=${CACHE_SMAXAGE_PRODUCTS}, stale-while-revalidate=${CACHE_SWR_PRODUCTS}`;
}

/**
 * Build Cache-Control for complete looks API.
 */
export function looksCacheControl(): string {
  return `public, max-age=0, s-maxage=${CACHE_SMAXAGE_LOOKS}, stale-while-revalidate=${CACHE_SWR_LOOKS}`;
}

/**
 * Cache-Control for error/404 responses — do not cache at CDN.
 */
export const CACHE_NO_STORE = "private, no-store, no-cache, must-revalidate";
