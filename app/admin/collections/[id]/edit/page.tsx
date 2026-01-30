"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

/**
 * Redirect /admin/collections/[id]/edit to collections list with edit param.
 * Edit form can be implemented as modal on main page later.
 */
export default function EditCollectionPage(): null {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  useEffect(() => {
    if (id) {
      router.replace(`/admin/collections?edit=${encodeURIComponent(id)}`);
    } else {
      router.replace("/admin/collections");
    }
  }, [router, id]);
  return null;
}
