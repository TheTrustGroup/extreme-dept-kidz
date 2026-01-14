"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart-store";
import { Container } from "@/components/ui/container";
import { H1 } from "@/components/ui/typography";

export default function PaymentStatusPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referenceId = searchParams.get("ref");
  const [status, setStatus] = React.useState<"processing" | "success" | "failed" | "timeout">("processing");
  const [message, setMessage] = React.useState("Processing payment...");
  const clearCart = useCartStore((state) => state.clearCart);

  React.useEffect(() => {
    if (!referenceId) {
      router.push("/checkout");
      return;
    }

    // Poll for payment status
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes (10s intervals)
    const pollInterval = 10000; // 10 seconds

    const pollPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/momo/verify?referenceId=${referenceId}`);
        const result = await response.json();

        if (result.success && result.data) {
          if (result.data.verified) {
            setStatus("success");
            setMessage("Payment successful! Your order is confirmed.");
            clearCart();
            
            // Redirect to success page after 3 seconds
            setTimeout(() => {
              router.push(`/checkout/success?ref=${referenceId}`);
            }, 3000);
            return;
          } else if (result.data.status === "FAILED") {
            setStatus("failed");
            setMessage("Payment failed. Please try again.");
            return;
          }
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setStatus("timeout");
          setMessage("Payment is taking longer than expected. Please check your phone or contact support.");
        }
      } catch (error) {
        console.error("Payment status check error:", error);
        attempts++;
        if (attempts >= maxAttempts) {
          setStatus("timeout");
          setMessage("Unable to verify payment status. Please contact support.");
        }
      }
    };

    // Start polling immediately, then every 10 seconds
    pollPaymentStatus();
    const interval = setInterval(pollPaymentStatus, pollInterval);

    return () => clearInterval(interval);
  }, [referenceId, router, clearCart]);

  return (
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
        <div className="max-w-2xl mx-auto text-center">
          {status === "processing" && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-navy-900 mx-auto mb-6"></div>
              <H1 className="text-charcoal-900 mb-4">Processing Payment</H1>
              <p className="text-charcoal-600 mb-6">
                Please check your phone and approve the MoMo payment prompt.
              </p>
              <p className="text-sm text-charcoal-500">
                This may take up to 2 minutes...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <H1 className="text-charcoal-900 mb-4">Payment Successful!</H1>
              <p className="text-charcoal-600 mb-6">
                Your order has been confirmed. Redirecting...
              </p>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <H1 className="text-charcoal-900 mb-4">Payment Failed</H1>
              <p className="text-charcoal-600 mb-6">{message}</p>
              <button
                onClick={() => router.push("/checkout")}
                className="px-6 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800"
              >
                Try Again
              </button>
            </>
          )}

          {status === "timeout" && (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <H1 className="text-charcoal-900 mb-4">Payment Status Unknown</H1>
              <p className="text-charcoal-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/checkout")}
                  className="px-6 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 mr-3"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/contact")}
                  className="px-6 py-3 bg-cream-200 text-charcoal-900 rounded-lg hover:bg-cream-300"
                >
                  Contact Support
                </button>
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
