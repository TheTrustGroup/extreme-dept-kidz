import { NextRequest } from 'next/server';
import { momoService } from '@/lib/payment/momo';
import { apiSuccess } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';

/**
 * MoMo webhook callback
 * Called by MoMo when payment status changes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔔 MoMo webhook received:', body);

    const { referenceId, status } = body;

    // Verify the webhook is authentic
    // TODO: Implement webhook signature verification

    // Update order status in database
    // TODO: Update database
    // if (status === 'SUCCESSFUL') {
    //   await db.orders.update({
    //     where: { referenceId },
    //     data: { status: 'PAID', paidAt: new Date() }
    //   });
    //   
    //   // Send confirmation email
    //   await sendOrderConfirmationEmail(order);
    // }

    return apiSuccess({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return apiSuccess({ received: true }); // Always return 200 to MoMo
  }
}
