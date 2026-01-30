import { NextRequest } from 'next/server';
import { momoService } from '@/lib/payment/momo';
import { apiSuccess, apiError } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referenceId = searchParams.get('referenceId');

  if (!referenceId) {
    return apiError('Reference ID required', 400);
  }

  try {
    // Verify payment with retry for transient failures
    const { retry } = await import('@/lib/utils/retry');
    const verification = await retry(
      () => momoService.verifyPayment(referenceId),
      {
        maxRetries: 2,
        initialDelayMs: 500,
      }
    );

    // TODO: Update order status in database
    // if (verification.verified) {
    //   await db.orders.update({
    //     where: { referenceId },
    //     data: { status: 'PAID', transactionId: verification.transactionId }
    //   });
    // }

    return apiSuccess(
      {
        verified: verification.verified,
        status: verification.status,
        transactionId: verification.transactionId,
      },
      verification.verified ? 'Payment verified' : 'Payment not completed'
    );
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return apiError('Verification failed', 500);
  }
}
