import type { ImageLoaderProps } from "next/image";

/**
 * Use as loader prop on product images when using Supabase Storage.
 * <Image loader={supabaseLoader} src={imageUrl} ... />
 */
export function supabaseLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith("http")) {
    return src;
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}

/**
 * Legacy hook for blur placeholders — return empty; use skeleton CSS / solid
 * backgrounds instead to avoid broken blur placeholders in some browsers.
 */
export function getBlurDataUrl(): string {
  return "";
}
