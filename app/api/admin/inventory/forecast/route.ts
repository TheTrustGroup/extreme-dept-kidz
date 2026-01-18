import { NextResponse, NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { getStockForecast } from "@/lib/services/admin/inventory-analytics.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/inventory/forecast
 * 
 * Get stock forecast for variants
 * Query params: variantId (optional)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // RBAC: Viewing forecasts requires manager role or higher
  const auth = await authenticateAndAuthorize(request, 'manager');
  if (auth.error) return auth.error;
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Insufficient permissions. Manager role required to view stock forecasts.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId') || undefined;

    const forecast = await getStockForecast(variantId);
    return apiSuccess(forecast, "Stock forecast fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch stock forecast:", error);
    return apiError(
      "Failed to fetch stock forecast",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
