/**
 * MTN MOBILE MONEY (MOMO) PAYMENT INTEGRATION
 * Production-ready implementation for Ghana
 */

import crypto from 'crypto';

interface MoMoConfig {
  apiKey: string;
  apiUser: string;
  subscriptionKey: string;
  environment: 'sandbox' | 'production';
  callbackUrl: string;
}

interface MoMoPaymentRequest {
  amount: string;
  currency: string;
  externalId: string; // Your order ID
  payer: {
    partyIdType: 'MSISDN';
    partyId: string; // Phone number
  };
  payerMessage: string;
  payeeNote: string;
}

interface MoMoPaymentResponse {
  financialTransactionId?: string;
  externalId: string;
  amount: string;
  currency: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reason?: string;
}

export class MoMoPaymentService {
  private config: MoMoConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiKey: process.env.MOMO_API_KEY || '',
      apiUser: process.env.MOMO_API_USER || '',
      subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY || '',
      environment: (process.env.MOMO_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      callbackUrl: process.env.MOMO_CALLBACK_URL || 'https://extremedeptkidz.com/api/payment/momo/callback',
    };

    this.baseUrl = this.config.environment === 'production'
      ? 'https://proxy.momoapi.mtn.com'
      : 'https://sandbox.momodeveloper.mtn.com';

    // Validate configuration
    if (!this.config.apiKey || !this.config.apiUser || !this.config.subscriptionKey) {
      console.warn('⚠️ MoMo configuration incomplete. Check environment variables.');
    }
  }

  /**
   * Generate API access token
   */
  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${this.config.apiUser}:${this.config.apiKey}`
    ).toString('base64');

    try {
      // Use fetch with timeout for external API calls
      const { fetchWithTimeout } = await import('@/lib/utils/fetch-with-timeout');
      const response = await fetchWithTimeout(
        `${this.baseUrl}/collection/token/`,
        {
          method: 'POST',
          timeoutMs: 10000, // 10 second timeout
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Token generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('❌ MoMo token generation failed:', error);
      throw new Error('Failed to authenticate with MoMo');
    }
  }

  /**
   * Generate UUID v4 for reference ID
   */
  private generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Request payment from customer
   */
  async requestPayment(params: {
    amount: number;
    phoneNumber: string;
    orderId: string;
    customerName: string;
  }): Promise<{ referenceId: string; success: boolean; error?: string }> {
    try {
      const token = await this.getAccessToken();
      const referenceId = this.generateUUID();

      // Format phone number (remove spaces, ensure country code)
      let formattedPhone = params.phoneNumber.replace(/\s+/g, '');
      if (!formattedPhone.startsWith('233')) {
        formattedPhone = '233' + formattedPhone.replace(/^0/, '');
      }

      const requestData: MoMoPaymentRequest = {
        amount: params.amount.toString(),
        currency: 'GHS',
        externalId: params.orderId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: formattedPhone,
        },
        payerMessage: `Payment for order #${params.orderId}`,
        payeeNote: `Extreme Dept Kidz - Order #${params.orderId}`,
      };

      console.log('📱 Initiating MoMo payment:', {
        amount: params.amount,
        phone: formattedPhone,
        orderId: params.orderId,
      });

      // Use fetch with timeout for external API calls
      const { fetchWithTimeout } = await import('@/lib/utils/fetch-with-timeout');
      const response = await fetchWithTimeout(
        `${this.baseUrl}/collection/v1_0/requesttopay`,
        {
          method: 'POST',
          timeoutMs: 10000, // 10 second timeout
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': this.config.environment,
            'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.status === 202) {
        // Payment request accepted
        console.log('✅ MoMo payment request accepted:', referenceId);
        
        return {
          referenceId,
          success: true,
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ MoMo payment request failed:', response.status, errorData);
        
        return {
          referenceId,
          success: false,
          error: errorData.message || 'Payment request failed',
        };
      }
    } catch (error) {
      console.error('❌ MoMo payment error:', error);
      return {
        referenceId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(referenceId: string): Promise<MoMoPaymentResponse | null> {
    try {
      const token = await this.getAccessToken();

      // Use fetch with timeout for external API calls
      const { fetchWithTimeout } = await import('@/lib/utils/fetch-with-timeout');
      const response = await fetchWithTimeout(
        `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
        {
          method: 'GET',
          timeoutMs: 10000, // 10 second timeout
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.config.environment,
            'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
          },
        }
      );

      if (!response.ok) {
        console.error('❌ Failed to get payment status:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('📊 Payment status:', data.status, referenceId);

      return data as MoMoPaymentResponse;
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      return null;
    }
  }

  /**
   * Verify payment completion
   */
  async verifyPayment(referenceId: string): Promise<{
    verified: boolean;
    status: string;
    amount?: string;
    transactionId?: string;
  }> {
    const paymentData = await this.getPaymentStatus(referenceId);

    if (!paymentData) {
      return {
        verified: false,
        status: 'UNKNOWN',
      };
    }

    return {
      verified: paymentData.status === 'SUCCESSFUL',
      status: paymentData.status,
      amount: paymentData.amount,
      transactionId: paymentData.financialTransactionId,
    };
  }

  /**
   * Refund payment (if supported)
   */
  async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    // TODO: Implement refund logic based on MoMo API capabilities
    console.warn('⚠️ Refund not yet implemented');
    return false;
  }
}

// Export singleton instance
export const momoService = new MoMoPaymentService();
