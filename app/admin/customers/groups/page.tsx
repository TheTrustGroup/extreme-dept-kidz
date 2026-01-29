import { redirect } from "next/navigation";

/**
 * Customer groups - redirects to Customers page.
 * Keeps sidebar link from 404ing on prefetch.
 */
export default function CustomerGroupsPage() {
  redirect("/admin/customers");
}
