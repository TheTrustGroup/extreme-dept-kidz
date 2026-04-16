"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { m } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { H1, Body } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";

/**
 * Forgot Password Page
 * 
 * Allows admin users to request a password reset.
 */
export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        setError("Please enter your email address.");
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/auth/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.message || data.details || "Failed to send reset email. Please try again.";
        console.error('[ForgotPassword] API Error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Success - show success message
      setSuccess(true);
      setLoading(false);

      // In development, show token if provided
      if (process.env.NODE_ENV === 'development' && data.data?.token) {
        console.log('[ForgotPassword] Development mode - Reset token:', data.data.token);
        console.log('[ForgotPassword] Reset URL:', data.data.resetUrl);
        console.log('[ForgotPassword] Full response:', data);
      }
    } catch (err) {
      console.error('[ForgotPassword] Error:', err);
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-navy-50 flex items-center justify-center p-4">
      <Container size="sm">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-cream-50 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-navy-900 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/Extreme Logo.png"
                alt="EXTREME DEPT KIDZ"
                width={200}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
            <H1 className="text-cream-50 text-2xl md:text-3xl font-serif font-bold mb-2">
              Reset Password
            </H1>
            <Body className="text-cream-100/80 text-sm">
              Enter your email to receive a reset link
            </Body>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </m.div>
            )}

            {success ? (
              <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">Check your email</p>
                      <p className="mt-1">
                        If an account with that email exists, we've sent a password reset link.
                        Please check your inbox and follow the instructions.
                      </p>
                    </div>
                  </div>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-navy-50 border border-navy-200 text-navy-700 px-4 py-3 rounded-lg text-xs">
                    <p className="font-semibold mb-1">Development Mode:</p>
                    <p>Check the browser console for the reset token and URL.</p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="compact"
                  onClick={() => router.push("/admin/login")}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </m.div>
            ) : (
              <>
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-compact-sm font-bold uppercase tracking-compact-label text-charcoal-900 mb-compact-2 leading-compact-tight"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    density="compact"
                    className="border-cream-300 bg-white focus-visible:ring-navy-500/20 focus-visible:border-navy-500"
                    placeholder="info@extremedeptkidz.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="compact"
                  className="w-full"
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/login")}
                    className="text-sm text-navy-900 hover:text-navy-700 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </form>
        </m.div>
      </Container>
    </div>
  );
}
