import { NextResponse, NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { getInventoryAnalytics } from "@/lib/services/admin/inventory-analytics.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/inventory/analytics
 * 
 * Get comprehensive inventory analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Viewing analytics requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Manager role required to view inventory analytics.' },
      { status: 403 }
    );
  }

  try {
    const analytics = await getInventoryAnalytics();
    return apiSuccess(analytics, "Inventory analytics fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch inventory analytics:", error);
    return apiError(
      "Failed to fetch inventory analytics",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
