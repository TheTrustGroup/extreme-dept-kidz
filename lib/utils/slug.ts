/**
 * URL-safe slug for routes like /collections/[slug] — lowercase, hyphens, [a-z0-9-] only.
 * Matches product slug normalization in admin product POST.
 */
export function normalizeUrlSlug(input: string, fallback = "item"): string {
  const s = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || fallback;
}
