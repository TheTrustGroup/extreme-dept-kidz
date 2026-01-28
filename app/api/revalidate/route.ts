import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const SECRET = process.env.REVALIDATE_SECRET;

function isAuthorized(request: NextRequest): boolean {
  if (!SECRET) return false;
  // GET: ?secret=xxx
  const q = request.nextUrl.searchParams.get("secret");
  if (q === SECRET) return true;
  // POST: Authorization: Bearer xxx or body.secret
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${SECRET}`) return true;
  return false;
}

/**
 * GET /api/revalidate?secret=REVALIDATE_SECRET
 *
 * Call this after each Vercel deploy to refresh collection and home caches.
 * Set REVALIDATE_SECRET in Vercel → Settings → Environment Variables.
 *
 * Example (run after deploy):
 *   curl "https://extremedeptkidz.com/api/revalidate?secret=YOUR_SECRET"
 *
 * Or from Vercel Cron (optional): add vercel.json with a cron that hits this URL.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    revalidatePath("/collections/boys");
    revalidatePath("/collections/girls");
    revalidatePath("/collections");
    revalidatePath("/");
    return NextResponse.json({
      revalidated: true,
      paths: ["/collections/boys", "/collections/girls", "/collections", "/"],
    });
  } catch (e) {
    console.error("Revalidate GET error:", e);
    return NextResponse.json({ error: "Revalidate failed" }, { status: 500 });
  }
}

/**
 * POST /api/revalidate
 *
 * Body: { path: "/products" } or { tag: "products" }, optionally { secret: "REVALIDATE_SECRET" }
 * Auth: Authorization: Bearer REVALIDATE_SECRET, or body.secret
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { path?: string; tag?: string; secret?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const ok = SECRET && (body.secret === SECRET || request.headers.get("authorization") === `Bearer ${SECRET}`);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { path, tag } = body;
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    }
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag });
    }
    return NextResponse.json({ error: "path or tag required" }, { status: 400 });
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json({ error: "Error revalidating cache" }, { status: 500 });
  }
}
