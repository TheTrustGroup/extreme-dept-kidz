import { redirect } from "next/navigation";

/**
 * Sales analytics - redirects to main Analytics page.
 * Keeps sidebar link from 404ing on prefetch.
 */
export default function AnalyticsSalesPage() {
  redirect("/admin/analytics");
}
