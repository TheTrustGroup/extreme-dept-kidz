"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

/**
 * Pull-to-refresh wrapper for mobile. Fires onRefresh when user pulls down past threshold.
 */
export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  className,
}: PullToRefreshProps): JSX.Element {
  const [pullY, setPullY] = React.useState(0);
  const [startY, setStartY] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startYRef = React.useRef(0);

  const isAtTop = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.scrollY <= 2;
  }, []);

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (disabled || refreshing) return;
      if (isAtTop()) {
        startYRef.current = e.touches[0].clientY;
        setStartY(e.touches[0].clientY);
      }
    },
    [disabled, refreshing, isAtTop]
  );

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (disabled || refreshing) return;
      if (!isAtTop() && pullY <= 0) return;
      const y = e.touches[0].clientY;
      const diff = y - startYRef.current;
      if (diff > 0) {
        const damped = Math.min(diff * 0.5, MAX_PULL);
        setPullY(damped);
      }
    },
    [disabled, refreshing, isAtTop, pullY]
  );

  const handleTouchEnd = React.useCallback(async () => {
    if (disabled || refreshing) return;
    if (pullY >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullY(0);
      try {
        await Promise.resolve(onRefresh());
      } finally {
        setRefreshing(false);
      }
    } else {
      setPullY(0);
    }
    setStartY(0);
  }, [disabled, refreshing, onRefresh, pullY]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Pull indicator - only visible when pulling on mobile */}
      <div
        className="absolute left-0 right-0 top-0 flex justify-center pointer-events-none transition-opacity duration-200 z-20"
        style={{
          height: pullY,
          opacity: pullY > 0 ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center justify-end pb-2 text-charcoal-500">
          {refreshing ? (
            <span className="text-xs font-medium">Refreshing…</span>
          ) : pullY >= PULL_THRESHOLD ? (
            <span className="text-xs font-medium">Release to refresh</span>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
