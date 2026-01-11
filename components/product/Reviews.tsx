'use client';

import { useState } from 'react';
import { reviews } from '@/lib/mock-data/reviews';
import type { Review } from '@/lib/mock-data/reviews';
import { Star, CheckCircle2, ThumbsUp } from 'lucide-react';
import Image from 'next/image';

interface ReviewsProps {
  productId: string;
}

export function Reviews({ productId }: ReviewsProps) {
  const productReviews = reviews.filter((r) => r.productId === productId);
  const averageRating =
    productReviews.length > 0
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300 fill-gray-300'
        }`}
      />
    ));
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = productReviews.filter((r) => r.rating === rating).length;
    const percentage = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="mt-12 border-t pt-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
            <span className="text-gray-600">
              ({productReviews.length} review{productReviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
        <button className="px-6 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors font-semibold">
          Write a Review
        </button>
      </div>

      {/* Rating Distribution */}
      {productReviews.length > 0 && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-4">Rating Breakdown</h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium w-8">{rating} star</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {productReviews.length > 0 ? (
          productReviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.author}</span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>
              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
              
              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <Image src={img} alt={`Review image ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>Helpful ({review.helpful})</span>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No reviews yet</p>
            <button className="px-6 py-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-colors font-semibold">
              Be the first to review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
