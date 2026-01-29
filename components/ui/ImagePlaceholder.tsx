"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ImagePlaceholderProps {
  /** Image source */
  src: string;
  /** Alt text */
  alt: string;
  /** Image dimensions */
  width?: number;
  height?: number;
  /** Fill container */
  fill?: boolean;
  /** Custom className */
  className?: string;
  /** Sizes for responsive images */
  sizes?: string;
  /** Priority loading */
  priority?: boolean;
  /** Quality (1-100) */
  quality?: number;
  /** Placeholder blur data URL */
  blurDataURL?: string;
  /** On error callback */
  onError?: () => void;
  /** Show pulse animation while loading */
  showPulse?: boolean;
}

/**
 * ImagePlaceholder Component
 * 
 * Enhanced Image component with error handling and pulse animation.
 */
export function ImagePlaceholder({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  sizes,
  priority = false,
  quality = 80,
  blurDataURL,
  onError,
  showPulse = true,
}: ImagePlaceholderProps): JSX.Element {
  const { theme } = useTheme();
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleError = (): void => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = (): void => {
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 rounded-lg",
            theme === "dark"
              ? "bg-dark-bg-secondary text-dark-text-muted"
              : "bg-cream-100 text-charcoal-400"
          )}
        >
          <AlertCircle className="w-8 h-8" />
          <span className="text-xs text-center">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative",
        fill ? "absolute inset-0" : "",
        showPulse && isLoading && "animate-pulse",
        className
      )}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-100"
          )}
        >
          <ImageIcon
            className={cn(
              "w-8 h-8 animate-pulse",
              theme === "dark" ? "text-dark-text-muted" : "text-charcoal-300"
            )}
          />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        blurDataURL={blurDataURL}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      />
    </div>
  );
}
