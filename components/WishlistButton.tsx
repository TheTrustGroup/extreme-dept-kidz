'use client';

import { useWishlistStore } from '@/lib/stores/wishlist-store';
import type { Product } from '@/types';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WishlistButton({ 
  product, 
  size = 'md',
  className 
}: WishlistButtonProps) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        `${sizeClasses[size]} flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all z-10`,
        inWishlist && 'bg-red-50',
        className
      )}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={cn(
          iconSizes[size],
          inWishlist
            ? 'fill-red-500 text-red-500'
            : 'fill-none text-gray-700 hover:text-red-500'
        )}
        strokeWidth={2}
      />
    </button>
  );
}
