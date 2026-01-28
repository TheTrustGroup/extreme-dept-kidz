import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/revalidate-collections
 *
 * Revalidates collection pages so the site shows fresh product data.
 * Use when products were fixed elsewhere (e.g. script) or cache is stale.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, "admin");
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: "Insufficient permissions. Admin role required." },
      { status: 403 }
    );
  }

  try {
    revalidatePath("/collections/boys");
    revalidatePath("/collections/girls");
    if (prisma) {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true },
      });
      for (const c of categories) {
        if (c.slug && c.slug !== "boys" && c.slug !== "girls") {
          revalidatePath(`/collections/${c.slug}`);
        }
      }
    }
    revalidatePath("/collections");
    revalidatePath("/");
  } catch (e) {
    logger.error("Revalidate failed:", e);
    return apiError("Failed to revalidate cache", 500, e instanceof Error ? e.message : "Unknown error");
  }

  return apiSuccess({ revalidated: true }, "Collections cache refreshed.");
}
