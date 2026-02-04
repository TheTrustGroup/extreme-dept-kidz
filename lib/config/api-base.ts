/**
 * API base URL for client-side fetch calls.
 *
 * When the app is deployed as the warehouse (e.g. warehouse.extremedeptkidz.com),
 * set NEXT_PUBLIC_API_URL to the main site (e.g. https://extremedeptkidz.com) so
 * all admin/inventory API calls hit the main site database. Otherwise requests
 * go to the warehouse host and data is never saved.
 *
 * - Main site: leave unset or empty → same-origin (relative URLs).
 * - Warehouse: set NEXT_PUBLIC_API_URL=https://extremedeptkidz.com in env.
 */

export function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/$/, "");
}

/**
 * Build full URL for an API path. Use for admin/inventory fetches from the warehouse.
 * @param path - e.g. "/api/admin/inventory" or "/api/admin/inventory/sync"
 */
export function apiUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
