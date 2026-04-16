import { NextRequest } from 'next/server';
import { momoService } from '@/lib/payment/momo';
import { apiSuccess } from '@/lib/utils/api-response';
import { confirmOrderPayment } from '@/lib/services/order.service';
import { prisma } from '@/lib/db/prisma';
import {
  sendOrQueueAdminNewOrderEmail,
  sendOrQueueOrderConfirmationEmail,
} from '@/lib/services/notification-queue.service';
import { logger } from '@/lib/utils/logger';

export const dynamic = 'force-dynamic';

/**
 * MoMo webhook callback
 * Called by MoMo when payment status changes
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();

    const { referenceId, status } = body;

    // Verify the webhook is authentic
    // TODO: Implement webhook signature verification

    const callbackStatus = typeof status === 'string' ? status.toUpperCase() : '';
    if (referenceId && callbackStatus === 'SUCCESSFUL') {
      // Fetch payment record from MoMo to resolve the real orderId (externalId).
      const paymentDetails = await momoService.getPaymentStatus(String(referenceId));
      const orderId = paymentDetails?.externalId || String(referenceId);
      const paymentState = await confirmOrderPayment(orderId);

      if (prisma && paymentState.alreadyCompleted === false) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            paymentMethod: true,
            shippingAddress: true,
          },
        });

        if (order && order.shippingAddress && typeof order.shippingAddress === 'object') {
          const addr = order.shippingAddress as {
            firstName?: string;
            lastName?: string;
            email?: string;
            phone?: string;
            address?: string;
            apartment?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
          };
          const customerName = `${addr.firstName ?? ''} ${addr.lastName ?? ''}`.trim() || 'Customer';
          const shippingSummary = [
            addr.address ?? '',
            [addr.apartment, addr.city, addr.state, addr.zipCode, addr.country]
              .filter(Boolean)
              .join(', '),
          ]
            .filter(Boolean)
            .join('\n');

          if (addr.email) {
            void sendOrQueueOrderConfirmationEmail(
              { to: addr.email, orderNumber: order.orderNumber, totalPesewas: order.total },
              { orderId, referenceId, source: 'momo.callback' }
            );
          }
          void sendOrQueueAdminNewOrderEmail({
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalPesewas: order.total,
            customerName,
            customerEmail: addr.email ?? 'unknown@unknown.local',
            customerPhone: addr.phone ?? 'N/A',
            shippingSummary,
            paymentMethod: order.paymentMethod,
          }, { orderId, referenceId, source: 'momo.callback' });
        }
      }
    }

    return apiSuccess({ received: true });
  } catch (error) {
    logger.error('[MoMo callback] webhook error', error);
    return apiSuccess({ received: true }); // Always return 200 to MoMo
  }
}
