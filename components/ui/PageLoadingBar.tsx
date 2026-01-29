"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * PageLoadingBar Component
 * 
 * Top loading bar for page transitions (like YouTube/Medium).
 * Shows progress during route changes.
 */
export function PageLoadingBar(): JSX.Element {
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    // Simulate loading progress
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Complete loading after a short delay
    const timeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pathname]);

  if (!loading && progress === 0) {
    return <></>;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] h-1 bg-cream-200 dark:bg-dark-bg-secondary overflow-hidden">
      <m.div
        className="h-full bg-navy-900 dark:bg-accent-primary"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}
