"use client";

import * as React from "react";
import { m } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface ZoomableImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  quality?: number;
  onLightboxOpen: () => void;
}

export function ZoomableImage({
  src,
  alt,
  sizes,
  priority = false,
  loading = "lazy",
  quality = 80,
  onLightboxOpen,
}: ZoomableImageProps): JSX.Element {
  const [isHovered, setIsHovered] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-zoom-in group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onLightboxOpen}
    >
      <m.div
        className="relative w-full h-full overflow-hidden"
        animate={{
          scale: isHovered ? 1.5 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
        }}
      >
        <OptimizedImage
          src={src}
          alt={alt}
          variant="product-detail"
          customSizes={sizes}
          isLCP={priority}
          useIntersectionObserver={!priority}
          enablePrefetch={false}
          quality={quality}
          className="object-cover"
          fill
        />
      </m.div>

      {/* Zoom Icon Overlay */}
      <m.div
        className="absolute inset-0 flex items-center justify-center bg-charcoal-900/0 pointer-events-none"
        animate={{
          opacity: isHovered ? 1 : 0,
          backgroundColor: isHovered ? "rgba(28, 28, 28, 0.1)" : "rgba(28, 28, 28, 0)", // brand-text overlay
        }}
        transition={{ duration: 0.3 }}
      >
        <ZoomIn className="w-8 h-8 text-cream-50 drop-shadow-lg" />
      </m.div>
    </div>
  );
}
