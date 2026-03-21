"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

interface ImageWithSkeletonProps extends ImageProps {
  skeletonClassName?: string;
}

export default function ImageWithSkeleton({
  skeletonClassName = "",
  className = "",
  onLoad,
  ...props
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div
          className={["absolute inset-0 skeleton", skeletonClassName].join(" ")}
          aria-hidden="true"
        />
      )}
      <Image
        {...props}
        className={[
          className,
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </div>
  );
}
