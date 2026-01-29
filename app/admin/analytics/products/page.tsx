import { redirect } from "next/navigation";

/**
 * Products analytics - redirects to main Analytics page.
 * Keeps sidebar link from 404ing on prefetch.
 */
export default function AnalyticsProductsPage() {
  redirect("/admin/analytics");
}
