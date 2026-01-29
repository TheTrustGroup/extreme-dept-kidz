/**
 * Admin Activity Logging Service
 * 
 * Handles logging of admin actions for audit trails.
 * 
 * Features:
 * - Automatic IP and user agent capture
 * - Structured logging with action types
 * - Resource tracking (what was affected)
 * - Details storage (before/after values)
 * - Querying and filtering
 */

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';
import { NextRequest } from 'next/server';

export interface ActivityLogData {
  adminUserId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityLogFilters {
  adminUserId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Extract IP address and user agent from request
 */
export function extractRequestMetadata(request?: NextRequest): {
  ipAddress?: string;
  userAgent?: string;
} {
  if (!request) {
    return {};
  }

  // Get IP address
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';

  // Get user agent
  const userAgent = request.headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}

/**
 * Log an admin activity
 * 
 * @param data - Activity log data
 * @param request - Optional request object for IP/user agent extraction
 * @returns Promise<boolean> - true if logged successfully
 * 
 * @example
 * await logActivity({
 *   adminUserId: user.id,
 *   action: 'product.created',
 *   resource: 'Product',
 *   resourceId: product.id,
 *   details: { name: product.name }
 * }, request);
 */
export async function logActivity(
  data: ActivityLogData,
  request?: NextRequest
): Promise<boolean> {
  // Validate required fields
  if (!data.adminUserId || !data.action) {
    logger.warn('[ActivityLog] Missing required fields: adminUserId or action');
    return false;
  }

  try {
    if (!prisma) {
      logger.warn('[ActivityLog] Prisma client not available');
      return false;
    }

    // Extract metadata from request if provided
    const metadata = extractRequestMetadata(request);
    
    // Merge metadata with provided data
    const logData = {
      id: undefined as any, // Let Prisma generate ID
      adminUserId: data.adminUserId,
      action: data.action,
      resource: data.resource || null,
      resourceId: data.resourceId || null,
      details: data.details ? (data.details as any) : null,
      ipAddress: data.ipAddress || metadata.ipAddress || null,
      userAgent: data.userAgent || metadata.userAgent || null,
    };

    // Use transaction for atomic write
    await prisma.$transaction(async (tx) => {
      await tx.adminActivityLog.create({
        data: logData,
      });
    }, {
      timeout: 5000, // 5 second timeout
    });

    if (process.env.NODE_ENV === 'development') {
      logger.log(`[ActivityLog] ✅ Logged action: ${data.action} by user ${data.adminUserId} (${data.resource || 'N/A'})`);
    }
    return true;
  } catch (error) {
    // Don't throw - logging failures shouldn't break the app
    // But log the error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`[ActivityLog] ❌ Failed to log activity: ${data.action} by ${data.adminUserId}`, {
      error: errorMessage,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
    });
    return false;
  }
}

/**
 * Get activity logs with filtering
 * 
 * @param filters - Filter criteria
 * @returns Promise<ActivityLog[]>
 */
export async function getActivityLogs(filters: ActivityLogFilters = {}) {
  try {
    if (!prisma) {
      logger.error('[ActivityLog] Prisma client not available');
      return [];
    }

    const {
      adminUserId,
      action,
      resource,
      resourceId,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    // Validate limit
    const validLimit = Math.min(Math.max(1, limit || 50), 100); // Between 1 and 100
    const validOffset = Math.max(0, offset || 0);

    const where: any = {};

    if (adminUserId) {
      where.adminUserId = adminUserId;
    }

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const logs = await prisma.adminActivityLog.findMany({
      where,
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: validLimit,
      skip: validOffset,
    });

    return logs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`[ActivityLog] Failed to get activity logs: ${errorMessage}`, {
      filters,
      error: errorMessage,
    });
    return [];
  }
}

/**
 * Get activity logs count (for pagination)
 */
export async function getActivityLogsCount(filters: ActivityLogFilters = {}): Promise<number> {
  try {
    if (!prisma) {
      return 0;
    }

    const {
      adminUserId,
      action,
      resource,
      resourceId,
      startDate,
      endDate,
    } = filters;

    const where: any = {};

    if (adminUserId) {
      where.adminUserId = adminUserId;
    }

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    return await prisma.adminActivityLog.count({ where });
  } catch (error) {
    logger.error('[ActivityLog] Failed to get activity logs count:', error);
    return 0;
  }
}

/**
 * Get activity logs for a specific user
 */
export async function getUserActivity(
  adminUserId: string,
  limit: number = 50
) {
  return getActivityLogs({ adminUserId, limit });
}

/**
 * Get activity logs for a specific resource
 */
export async function getResourceActivity(
  resource: string,
  resourceId: string,
  limit: number = 50
) {
  return getActivityLogs({ resource, resourceId, limit });
}

/**
 * Common action types for consistency
 */
export const ActivityActions = {
  // Product actions
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  
  // Order actions
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_REFUNDED: 'order.refunded',
  
  // Inventory actions
  INVENTORY_UPDATED: 'inventory.updated',
  INVENTORY_ADJUSTED: 'inventory.adjusted',
  
  // Category actions
  CATEGORY_CREATED: 'category.created',
  CATEGORY_UPDATED: 'category.updated',
  CATEGORY_DELETED: 'category.deleted',
  
  // Collection actions
  COLLECTION_CREATED: 'collection.created',
  COLLECTION_UPDATED: 'collection.updated',
  COLLECTION_DELETED: 'collection.deleted',
  
  // Complete Look actions
  COMPLETE_LOOK_CREATED: 'complete_look.created',
  COMPLETE_LOOK_UPDATED: 'complete_look.updated',
  COMPLETE_LOOK_DELETED: 'complete_look.deleted',
  
  // Admin user actions
  ADMIN_USER_CREATED: 'admin_user.created',
  ADMIN_USER_UPDATED: 'admin_user.updated',
  ADMIN_USER_DELETED: 'admin_user.deleted',
  ADMIN_USER_ROLE_CHANGED: 'admin_user.role_changed',
  ADMIN_USER_PASSWORD_RESET: 'admin_user.password_reset',
  
  // Auth actions
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  LOGIN_FAILED: 'auth.login_failed',

  // Customer actions
  CUSTOMER_VIEWED: 'customer.viewed',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_NOTE_ADDED: 'customer.note_added',
  CUSTOMER_ADDRESS_ADDED: 'customer.address_added',
  CUSTOMER_ADDRESS_UPDATED: 'customer.address_updated',
  CUSTOMER_ADDRESS_DELETED: 'customer.address_deleted',
  CUSTOMER_DISABLED: 'customer.disabled',
  CUSTOMER_ENABLED: 'customer.enabled',
  CUSTOMER_DELETED: 'customer.deleted',
  CUSTOMER_PASSWORD_RESET: 'customer.password_reset',
  CUSTOMER_VERIFICATION_SENT: 'customer.verification_sent',
} as const;
