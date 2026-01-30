import { NextRequest, NextResponse } from "next/server";
import {
  revalidatePath,
  revalidateTag,
} from "next/cache";
import {
  revalidateAllCollectionPages,
  revalidateProduct,
  revalidateCollectionPage,
  CACHE_TAGS,
} from "@/lib/utils/cache-revalidation";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

/** Optional: require REVALIDATE_SECRET or WEBHOOK_SECRET in header or body for external callers */
function isAuthorized(request: NextRequest, body: { secret?: string }): boolean {
  const secret =
    process.env.REVALIDATE_SECRET || process.env.WEBHOOK_SECRET;
  if (!secret) return true; // No secret configured = allow (e.g. same-origin only)
  const headerSecret = request.headers.get("x-webhook-secret");
  const bodySecret = body?.secret;
  return headerSecret === secret || bodySecret === secret;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: {
    productId?: string;
    productSlug?: string;
    action?: string;
    categorySlug?: string;
    secret?: string;
  } = {};

  try {
    body = await request.json().catch(() => ({}));
  } catch {
    // empty body ok
  }

  if (!isAuthorized(request, body)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, productSlug, action, categorySlug } = body;

  try {
    // Revalidate tags so all product-dependent pages refresh
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.homepage);
    revalidateTag(CACHE_TAGS.collections);
    revalidateTag(CACHE_TAGS.categories);

    // Revalidate core paths
    revalidatePath("/", "page");
    revalidatePath("/collections", "page");
    revalidatePath("/products", "page");
    revalidatePath("/api/products");

    // Product-specific revalidation
    if (productSlug) {
      revalidateProduct(productSlug, productId);
      revalidatePath(`/products/${productSlug}`, "page");
    }

    if (categorySlug) {
      revalidateCollectionPage(categorySlug);
      revalidatePath(`/collections/${categorySlug}`, "page");
    }

    // Revalidate all collection pages (handles boys, girls, etc.)
    await revalidateAllCollectionPages();

    logger.log(
      `[Webhook] product-updated revalidated: action=${action || "unknown"} slug=${productSlug || "n/a"}`
    );

    return NextResponse.json({
      revalidated: true,
      time: new Date().toISOString(),
      productId: productId ?? null,
      productSlug: productSlug ?? null,
      action: action ?? null,
    });
  } catch (err) {
    logger.error("[Webhook] product-updated revalidation error:", err);
    return NextResponse.json(
      { error: "Error revalidating", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
