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
 * Send Web Vitals to analytics endpoint
 */
function sendToAnalytics(metric: Metric): void {
  // In production, send to your analytics service
  // Example: Google Analytics, Vercel Analytics, etc.
  
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Example: Send to Vercel Analytics
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

