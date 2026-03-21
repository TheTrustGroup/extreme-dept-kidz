"use client";

import { useEffect } from "react";
import ErrorBoundaryFallback from "@/components/ui/ErrorBoundaryFallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ErrorBoundaryFallback
        error={error}
        reset={reset}
        message="Something went wrong loading this page. Please try again."
      />
    </main>
  );
}
