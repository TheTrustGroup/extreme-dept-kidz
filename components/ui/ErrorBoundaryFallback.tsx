"use client";

import { RefreshCw } from "lucide-react";

interface ErrorBoundaryFallbackProps {
  error?: Error;
  reset?: () => void;
  message?: string;
  compact?: boolean;
}

export default function ErrorBoundaryFallback({
  error,
  reset,
  message = "Something went wrong loading this section.",
  compact = false,
}: ErrorBoundaryFallbackProps) {
  if (compact) {
    return (
      <div className="error-fallback error-fallback--compact">
        <p className="error-fallback__msg-compact">{message}</p>
        {reset && (
          <button
            type="button"
            className="error-fallback__retry-compact"
            onClick={reset}
            aria-label="Retry"
          >
            <RefreshCw size={13} strokeWidth={1.5} />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="error-fallback">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="error-fallback__icon"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="20" />
        <line x1="24" y1="16" x2="24" y2="26" />
        <circle cx="24" cy="33" r="1.5" fill="currentColor" stroke="none" />
      </svg>

      <h3 className="error-fallback__title">Something went wrong</h3>
      <p className="error-fallback__desc">{message}</p>

      {process.env.NODE_ENV === "development" && error?.message && (
        <pre className="error-fallback__detail">{error.message}</pre>
      )}

      {reset && (
        <button
          type="button"
          className="error-fallback__retry"
          onClick={reset}
        >
          <RefreshCw size={14} strokeWidth={1.5} />
          Try again
        </button>
      )}
    </div>
  );
}
