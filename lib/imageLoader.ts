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
 * Blur placeholder — cream-colour base64 JPEG for use as blurDataURL.
 * Reduces layout shift and improves perceived LCP.
 */
export function getBlurDataUrl(_width = 10, _height = 13): string {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAANAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQQD/8QAIBAAAgIBBAMAAAAAAAAAAAAAAQIDBAUREiExQf/EABQBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCl1bVqOp2ba3LZlleRuN2TnAAA4AHoBRRQB//Z";
}
