"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/** Tiny gray JPEG for blur placeholder (Next.js accepts JPEG/PNG/WebP for blurDataURL) */
const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAPwA/9k=";

interface SimpleOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  /** Use fill layout (parent must be position: relative with size) */
  fill?: boolean;
  sizes?: string;
  onError?: () => void;
}

/**
 * Drop-in Next.js Image for replacing <img>: lazy load, blur placeholder, quality 85.
 */
export function SimpleOptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onError,
}: SimpleOptimizedImageProps): JSX.Element {
  const blurDataURL = BLUR_PLACEHOLDER;
  const w = width ?? 800;
  const h = height ?? 800;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL={blurDataURL}
        sizes={sizes}
        onError={onError}
        className={cn("object-cover transition-transform duration-300 hover:scale-105", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      quality={85}
      placeholder="blur"
      blurDataURL={blurDataURL}
      sizes={sizes}
      onError={onError}
      className={cn("object-cover transition-transform duration-300 hover:scale-105", className)}
    />
  );
}

/** Default export for drop-in use: import OptimizedImage from '@/components/ui/SimpleOptimizedImage' */
export default SimpleOptimizedImage;
