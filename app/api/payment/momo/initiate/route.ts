import { NextRequest } from 'next/server';
import { momoService } from '@/lib/payment/momo';
import { apiSuccess, apiError, apiValidationError } from '@/lib/utils/api-response';
import { createRateLimitMiddleware, RATE_LIMITS } from '@/lib/security/rate-limiter';
import { z } from 'zod';
import { validate } from '@/lib/validation/schemas';

const paymentSchema = z.object({
  amount: z.number().positive().max(10000, 'Amount too large'),
  phoneNumber: z.string().regex(/^0\d{9}$|^233\d{9}$/, 'Invalid phone number'),
  orderId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Rate limiting (Redis-backed with in-memory fallback)
  const rateLimitCheck = createRateLimitMiddleware(RATE_LIMITS.PAYMENT);
  const rateLimitResponse = await rateLimitCheck(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate input
    const validation = validate(paymentSchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    const { amount, phoneNumber, orderId, customerName, customerEmail } = validation.data;

    // Initiate MoMo payment (with retry for transient failures)
    const { retry } = await import('@/lib/utils/retry');
    const result = await retry(
      () => momoService.requestPayment({
        amount,
        phoneNumber,
        orderId,
        customerName,
      }),
      {
        maxRetries: 2,
        initialDelayMs: 500,
      }
    );

    if (!result.success) {
      return apiError(
        'Payment initiation failed',
        400,
        result.error
      );
    }

    // TODO: Save payment record to database
    // await db.payments.create({
    //   referenceId: result.referenceId,
    //   orderId,
    //   amount,
    //   status: 'PENDING',
    //   customerEmail,
    //   phoneNumber,
    // });

    return apiSuccess(
      {
        referenceId: result.referenceId,
        status: 'PENDING',
        message: 'Please check your phone to approve the payment',
      },
      'Payment initiated successfully'
    );
  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    return apiError(
      'Payment initiation failed',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
