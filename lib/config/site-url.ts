/**
 * Site URL Configuration
 * 
 * Centralized site URL management to replace hardcoded URLs throughout the codebase.
 * Uses NEXT_PUBLIC_SITE_URL environment variable with fallback for development.
 */

/**
 * Get the site URL from environment variable
 * 
 * In production runtime, NEXT_PUBLIC_SITE_URL must be set.
 * In development/build, falls back to localhost:3000 or env var if set.
 * 
 * @returns Site URL (e.g., https://extremedeptkidz.com)
 */
export function getSiteUrl(): string {
  // Skip validation during build time
  const isBuildTime = 
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build';
  
  // In production runtime (not build), require env var
  if (process.env.NODE_ENV === 'production' && !isBuildTime) {
    const url = process.env.NEXT_PUBLIC_SITE_URL;
    if (!url || url.trim() === '') {
      throw new Error(
        '❌ CRITICAL: NEXT_PUBLIC_SITE_URL environment variable is required in production.\n' +
        '   Set NEXT_PUBLIC_SITE_URL in Vercel → Settings → Environment Variables.\n' +
        '   Example: https://extremedeptkidz.com'
      );
    }
    return url.trim().replace(/\/$/, ''); // Remove trailing slash
  }
  
  // In development/build, use env var if set, otherwise localhost
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '') || 'http://localhost:3000';
}

/**
 * Get the site URL as a URL object
 */
export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl());
}

/**
 * Build a full URL for a path
 * 
 * @param path - Path to append (e.g., '/collections/boys')
 * @returns Full URL (e.g., https://extremedeptkidz.com/collections/boys)
 */
export function getSiteUrlForPath(path: string): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get the site URL for Open Graph images
 */
export function getOgImageUrl(): string {
  return getSiteUrlForPath('/og-image.jpg');
}
