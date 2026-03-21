/**
 * Web Vitals monitoring — report to analytics.
 * Targets: LCP < 2.5s, FID/INP < 100ms, CLS < 0.1, TTI < 3.5s
 */

export type Metric = {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  entries: PerformanceEntry[];
};

function sendToAnalytics(metric: Metric) {
  if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    const w = window as unknown as { gtag: (a: string, b: string, c: Record<string, unknown>) => void };
    w.gtag("event", metric.name, {
      event_category: "Web Vitals",
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  if (process.env.NODE_ENV === "development") {
    const colour =
      metric.rating === "good"
        ? "\x1b[32m"
        : metric.rating === "needs-improvement"
          ? "\x1b[33m"
          : "\x1b[31m";
    console.log(
      `${colour}[Web Vitals] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})\x1b[0m`
    );
  }

  // Option: send to your own analytics endpoint
  // fetch('/api/vitals', { method: 'POST', body: JSON.stringify(metric), headers: { 'Content-Type': 'application/json' }, keepalive: true })
}

export function reportWebVitals(metric: Metric) {
  switch (metric.name) {
    case "CLS":
    case "LCP":
    case "INP":
    case "FCP":
    case "TTFB":
      sendToAnalytics(metric);
      break;
  }
}
