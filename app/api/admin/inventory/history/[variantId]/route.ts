import { NextResponse, NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { getStockHistory } from "@/lib/services/admin/inventory-analytics.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/inventory/history/[variantId]
 * 
 * Get stock history for a variant
 * Query params: limit (optional, default 50)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
): Promise<NextResponse> {
  // RBAC: Viewing history requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Manager role required to view stock history.' },
      { status: 403 }
    );
  }

  try {
    const { variantId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const history = await getStockHistory(variantId, limit);
    return apiSuccess(history, "Stock history fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch stock history:", error);
    return apiError(
      "Failed to fetch stock history",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
