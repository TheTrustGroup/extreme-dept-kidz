import { onCLS, onFCP, onLCP, onTTFB, onINP } from "web-vitals";

type Metric = {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  entries: PerformanceEntry[];
};

/**
 * CRITICAL: Send Web Vitals to analytics endpoint
 * Performance targets:
 * - LCP < 1.8s (mobile)
 * - FCP < 1.0s
 * - TTI < 2.3s
 * - CLS < 0.05
 */
function sendToAnalytics(metric: Metric): void {
  // CRITICAL: Only log in development to avoid console overhead
  if (process.env.NODE_ENV === "development") {
    // Check if metric meets performance targets
    const isGood = metric.rating === "good";
    const targetMet = 
      (metric.name === "LCP" && metric.value < 1800) ||
      (metric.name === "FCP" && metric.value < 1000) ||
      (metric.name === "TTI" && metric.value < 2300) ||
      (metric.name === "CLS" && metric.value < 0.05) ||
      (metric.name !== "LCP" && metric.name !== "FCP" && metric.name !== "TTI" && metric.name !== "CLS");
    
    if (!targetMet) {
      console.error(`[Web Vitals] ⚠️ ${metric.name} target not met:`, {
        value: metric.value,
        rating: metric.rating,
        target: metric.name === "LCP" ? "< 1800ms" : metric.name === "FCP" ? "< 1000ms" : metric.name === "TTI" ? "< 2300ms" : metric.name === "CLS" ? "< 0.05" : "N/A",
      });
    } else if (isGood) {
      console.log(`[Web Vitals] ✅ ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
      });
    }
  }

  // CRITICAL: Send to analytics in production (Vercel Analytics, etc.)
  // Uncomment and configure your analytics service:
  // if (typeof window !== "undefined" && (window as any).va) {
  //   (window as any).va("event", metric.name, {
  //     value: Math.round(metric.value),
  //     metric_id: metric.id,
  //     metric_value: metric.value,
  //     metric_delta: metric.delta,
  //   });
  // }
}

/**
 * Initialize Web Vitals monitoring
 */
export function reportWebVitals(): void {
  if (typeof window === "undefined") return;

  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}

