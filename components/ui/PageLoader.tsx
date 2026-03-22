"use client";
import * as React from "react";

/**
 * BrandSpinner — EDK luxury loading indicator
 * Gold ring on navy background, minimal and fast.
 */
export function BrandSpinner(): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100svh",
        backgroundColor: "var(--bg-page, #faf8f5)",
      }}
      role="status"
      aria-label="Loading"
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        {/* Outer ring — navy */}
        <div style={{ position: "relative", width: "44px", height: "44px" }}>
          {/* Track */}
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid rgba(15,23,42,0.1)",
          }} />
          {/* Spinning arc — gold */}
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "#c9a227",
            borderRightColor: "#c9a227",
            animation: "edk-spin 0.8s cubic-bezier(0.4,0,0.2,1) infinite",
          }} />
        </div>
        {/* Brand wordmark */}
        <p style={{
          fontFamily: "var(--font-montserrat, Montserrat, sans-serif)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(15,23,42,0.35)",
          margin: 0,
        }}>
          Extreme Dept Kidz
        </p>
      </div>
      <style>{`
        @keyframes edk-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * PageLoader — thin wrapper used in Suspense fallbacks.
 * Defaults to the brand spinner.
 */
export function PageLoader(): JSX.Element {
  return <BrandSpinner />;
}

/**
 * Spinner — inline variant for buttons and small contexts.
 */
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }): JSX.Element {
  const dim = size === "sm" ? "16px" : size === "lg" ? "28px" : "20px";
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: dim,
        height: dim,
        borderRadius: "50%",
        border: "2px solid rgba(15,23,42,0.1)",
        borderTopColor: "#c9a227",
        borderRightColor: "#c9a227",
        animation: "edk-spin 0.8s cubic-bezier(0.4,0,0.2,1) infinite",
        flexShrink: 0,
        display: "inline-block",
      }}
    >
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        Loading
      </span>
      <style>{`
        @keyframes edk-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PageLoader;
