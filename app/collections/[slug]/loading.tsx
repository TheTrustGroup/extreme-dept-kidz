import { Container } from "@/components/ui/container";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

/**
 * Loading UI for Collection Page
 * 
 * Shows skeleton loaders while the collection page is loading.
 */
export default function CollectionLoading(): JSX.Element {
  return (
    <div className="min-h-screen bg-cream-50 pt-20 md:pt-24 pb-16">
      <Container size="lg">
        {/* Page Header Skeleton */}
        <div className="mb-8 md:mb-12 space-y-4">
          <div className="h-10 w-64 bg-cream-200 rounded-lg animate-shimmer" />
          <div className="h-6 w-96 bg-cream-200 rounded-lg animate-shimmer" />
        </div>

        {/* Content Skeleton */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar Skeleton */}
          <div className="hidden lg:block w-64 space-y-6">
            <div className="h-6 w-32 bg-cream-200 rounded-lg animate-shimmer" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-24 bg-cream-200 rounded animate-shimmer" />
              ))}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            <div className="mb-8">
              <div className="h-6 w-48 bg-cream-200 rounded-lg animate-shimmer" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

