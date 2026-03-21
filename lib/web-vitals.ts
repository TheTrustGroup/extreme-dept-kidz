import { onCLS, onFCP, onLCP, onTTFB, onINP } from "web-vitals";
import { reportWebVitals as reportMetric } from "@/lib/webVitals";

/**
 * Initialize Web Vitals monitoring — delegates to lib/webVitals for analytics.
 */
export function reportWebVitals(): void {
  if (typeof window === "undefined") return;

  onCLS(reportMetric);
  onFCP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
  onINP(reportMetric);
}

