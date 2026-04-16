"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { m } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { H1, Body } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";

/**
 * Reset Password Page
 * 
 * Allows admin users to reset their password using a reset token.
 */
export default function ResetPasswordPage(): JSX.Element {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [verifying, setVerifying] = React.useState(true);
  const [tokenValid, setTokenValid] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Verify token on mount
  React.useEffect(() => {
    const verifyToken = async (): Promise<void> => {
      if (!token) {
        setError("Reset token is missing. Please request a new password reset.");
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/auth/password-reset/verify?token=${encodeURIComponent(token)}`, {
          credentials: 'include', // Include cookies for authentication
        });
        const data = await response.json();

        if (!response.ok || !data.data?.valid) {
          setError(data.error || data.message || "Invalid or expired reset token. Please request a new password reset.");
          setTokenValid(false);
        } else {
          setTokenValid(true);
        }
      } catch (err) {
        console.error('[ResetPassword] Error verifying token:', err);
        setError("Failed to verify reset token. Please try again.");
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    // Validate passwords
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Reset token is missing. Please request a new password reset.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/password-reset/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
    } catch (err) {
      console.error('[ResetPassword] Error:', err);
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-navy-50 flex items-center justify-center p-4">
        <Container size="sm">
          <div className="bg-cream-50 rounded-2xl shadow-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 mx-auto mb-4"></div>
            <Body className="text-charcoal-700">Verifying reset token...</Body>
          </div>
        </Container>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-navy-50 flex items-center justify-center p-4">
        <Container size="sm">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-cream-50 rounded-2xl shadow-2xl overflow-hidden"
          >
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
                Invalid Reset Link
              </H1>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error || "This password reset link is invalid or has expired."}
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  size="compact"
                  onClick={() => router.push("/admin/forgot-password")}
                  className="w-full"
                >
                  Request New Reset Link
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="compact"
                  onClick={() => router.push("/admin/login")}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </m.div>
        </Container>
      </div>
    );
  }

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
              Enter your new password
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
                    <CheckCircle className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">Password reset successful!</p>
                      <p className="mt-1">Redirecting to login page...</p>
                    </div>
                  </div>
                </div>
              </m.div>
            ) : (
              <>
                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-compact-sm font-bold uppercase tracking-compact-label text-charcoal-900 mb-compact-2 leading-compact-tight"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      density="compact"
                      className="pr-12 border-cream-300 bg-white focus-visible:ring-navy-500/20 focus-visible:border-navy-500"
                      placeholder="Enter new password (min. 8 characters)"
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-compact-sm font-bold uppercase tracking-compact-label text-charcoal-900 mb-compact-2 leading-compact-tight"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      density="compact"
                      className="pr-12 border-cream-300 bg-white focus-visible:ring-navy-500/20 focus-visible:border-navy-500"
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="compact"
                  className="w-full"
                  disabled={loading || !password.trim() || !confirmPassword.trim()}
                >
                  {loading ? "Resetting..." : "Reset Password"}
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
