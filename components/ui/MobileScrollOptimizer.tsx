/**
 * MobileScrollOptimizer Component
 * 
 * Automatically optimizes scroll containers for mobile:
 * - Native momentum scrolling
 * - GPU acceleration
 * - Passive event listeners
 * - Prevents scroll jank
 */

"use client";

import * as React from "react";
import { optimizeScrollContainer, enableMomentumScrolling, enableGPUScroll } from "@/lib/utils/mobile-scroll";

interface MobileScrollOptimizerProps {
  children: React.ReactNode;
  /**
   * Whether to enable native momentum scrolling
   * Default: true
   */
  enableMomentum?: boolean;
  /**
   * Whether to enable GPU acceleration
   * Default: true
   */
  enableGPU?: boolean;
}

/**
 * MobileScrollOptimizer Component
 * 
 * Wraps scrollable containers and automatically optimizes them for mobile
 */
export function MobileScrollOptimizer({
  children,
  enableMomentum = true,
  enableGPU = true,
}: MobileScrollOptimizerProps): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Optimize scroll container
    if (enableMomentum && enableGPU) {
      optimizeScrollContainer(container);
    } else if (enableMomentum) {
      enableMomentumScrolling(container);
    } else if (enableGPU) {
      enableGPUScroll(container);
    }

    // Cleanup is handled by CSS, no need to remove styles
  }, [enableMomentum, enableGPU]);

  return (
    <div ref={containerRef} data-scroll-container>
      {children}
    </div>
  );
}
