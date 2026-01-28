'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Collection page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-charcoal-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-charcoal-600 mb-6">
          We encountered an error while loading the products.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-charcoal-900 text-cream-50 rounded-md hover:bg-charcoal-800 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
