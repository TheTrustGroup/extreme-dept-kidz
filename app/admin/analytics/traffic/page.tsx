import { redirect } from "next/navigation";

/**
 * Traffic analytics - redirects to main Analytics page.
 * Keeps sidebar link from 404ing on prefetch.
 */
export default function AnalyticsTrafficPage() {
  redirect("/admin/analytics");
}
