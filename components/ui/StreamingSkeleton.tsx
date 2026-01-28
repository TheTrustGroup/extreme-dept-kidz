/**
 * StreamingSkeleton Component
 * 
 * Ultra-optimized skeleton loader with elegant shimmer effect.
 * Prevents layout shift and provides luxury-grade loading experience.
 */

interface StreamingSkeletonProps {
  height?: string;
  className?: string;
  variant?: 'default' | 'product-grid' | 'section' | 'card';
}

export function StreamingSkeleton({ 
  height = 'h-96', 
  className = '',
  variant = 'default'
}: StreamingSkeletonProps): JSX.Element {
  // Variant-specific skeletons with shimmer
  if (variant === 'product-grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ 
              contain: 'layout style paint',
              animationDelay: `${i * 50}ms`
            }}
          >
            <div className="aspect-square bg-gradient-to-br from-cream-100 via-cream-200 to-cream-100 rounded-xl mb-4 overflow-hidden relative">
              <div className="absolute inset-0 shimmer-overlay" />
            </div>
            <div className="h-4 bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 rounded mb-2 w-3/4 overflow-hidden relative">
              <div className="absolute inset-0 shimmer-overlay" />
            </div>
            <div className="h-4 bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 rounded w-1/2 overflow-hidden relative">
              <div className="absolute inset-0 shimmer-overlay" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className={`${height} ${className}`} style={{ contain: 'layout style paint' }}>
        <div className="space-y-4">
          <div className="h-8 bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 rounded w-1/3 overflow-hidden relative">
            <div className="absolute inset-0 shimmer-overlay" />
          </div>
          <div className="h-64 bg-gradient-to-br from-cream-100 via-cream-200 to-cream-100 rounded overflow-hidden relative">
            <div className="absolute inset-0 shimmer-overlay" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${className}`} style={{ contain: 'layout style paint' }}>
        <div className="skeleton-shimmer">
          <div className="aspect-square bg-gradient-to-br from-cream-100 via-cream-200 to-cream-100 rounded-xl mb-4 overflow-hidden relative">
            <div className="absolute inset-0 shimmer-overlay" />
          </div>
          <div className="h-4 bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 rounded mb-2 w-3/4 overflow-hidden relative">
            <div className="absolute inset-0 shimmer-overlay" />
          </div>
          <div className="h-4 bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 rounded w-1/2 overflow-hidden relative">
            <div className="absolute inset-0 shimmer-overlay" />
          </div>
        </div>
      </div>
    );
  }

  // Default skeleton with shimmer
  return (
    <div 
      className={`${height} ${className} skeleton-shimmer bg-gradient-to-br from-cream-100 via-cream-200 to-cream-100 overflow-hidden relative`}
      style={{ contain: 'layout style paint' }}
      aria-label="Loading content"
      role="status"
    >
      <div className="absolute inset-0 shimmer-overlay" />
    </div>
  );
}
