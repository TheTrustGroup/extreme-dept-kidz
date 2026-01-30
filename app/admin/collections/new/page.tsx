"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect /admin/collections/new to collections list.
 * Add collection form can be implemented as modal on main page later.
 */
export default function NewCollectionPage(): null {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/collections?new=1");
  }, [router]);
  return null;
}
