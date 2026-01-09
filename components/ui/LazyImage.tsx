'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
  showLoader?: boolean;
}

export function LazyImage({ showLoader = true, ...props }: LazyImageProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {showLoader && isLoading && (
        <div className="absolute inset-0 bg-cream-100 animate-pulse" />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          {...props}
          onLoad={() => setIsLoading(false)}
        />
      </motion.div>
    </div>
  );
}
