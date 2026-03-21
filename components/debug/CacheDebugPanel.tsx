"use client";

import { useState, useEffect } from "react";

interface CacheDebugPanelProps {
  productsCount: number;
  generatedAt: string;
}

/**
 * Temporary debug panel for diagnosing caching issues.
 * Shows in development, or in production when ?debug=1 is in the URL.
 * Remove after fixing caching.
 */
export function CacheDebugPanel({
  productsCount,
  generatedAt,
}: CacheDebugPanelProps): JSX.Element | null {
  const [show, setShow] = useState(process.env.NODE_ENV === "development");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (process.env.NODE_ENV !== "development" && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("debug") === "1") setShow(true);
    }
  }, []);

  if (process.env.NODE_ENV === "production") return null;
  if (!show || !mounted) return null;

  // Product data is server-only — no client fetch. Show server-passed count only.
  const handleTestAPI = (): void => {
    alert(`Server-passed product count: ${productsCount} (no client fetch)`);
  };

  const handleTestDB = async (): Promise<void> => {
    try {
      const res = await fetch("/api/debug/product-count");
      const data = await res.json();
      alert(
        `DB counts: total=${data.total ?? "?"}, inStock=${data.inStock ?? "?"}\n` +
          `Timestamp: ${data.timestamp ?? "?"}` +
          (data.error ? `\nError: ${data.error}` : "")
      );
    } catch (e) {
      alert(`Request error: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        background: "black",
        color: "white",
        padding: "1rem",
        fontSize: "12px",
        maxWidth: "320px",
        zIndex: 9999,
        fontFamily: "monospace",
        borderRadius: "8px 0 0 0",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.3)",
      }}
    >
      <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "13px" }}>Cache Debug</h4>
      <p style={{ margin: "0.25rem 0" }}>Products (SSR): {productsCount}</p>
      <p style={{ margin: "0.25rem 0" }}>Page generated: {generatedAt}</p>
      {typeof navigator !== "undefined" && (
        <p style={{ margin: "0.25rem 0", wordBreak: "break-all" }}>
          Browser: {navigator.userAgent.slice(0, 40)}…
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            cursor: "pointer",
            background: "#333",
            color: "white",
            border: "1px solid #666",
            borderRadius: "4px",
          }}
        >
          Force Refresh
        </button>
        <button
          type="button"
          onClick={handleTestAPI}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            cursor: "pointer",
            background: "#333",
            color: "white",
            border: "1px solid #666",
            borderRadius: "4px",
          }}
        >
          Test API
        </button>
        <button
          type="button"
          onClick={handleTestDB}
          style={{
            padding: "4px 8px",
            fontSize: "11px",
            cursor: "pointer",
            background: "#333",
            color: "white",
            border: "1px solid #666",
            borderRadius: "4px",
          }}
        >
          Test DB Count
        </button>
      </div>
    </div>
  );
}
