"use client";

import * as React from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error: _error, reset }: GlobalErrorProps): JSX.Element {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-cream-50 p-4">
          <div className="text-center max-w-md">
            <h1 className="mb-4 font-serif text-4xl font-bold text-charcoal-900">
              Application Error
            </h1>
            <p className="mb-8 font-sans text-lg text-charcoal-600">
              A critical error occurred. Please refresh the page or contact support.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-navy-900 text-cream-50 rounded-lg font-medium hover:bg-navy-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
