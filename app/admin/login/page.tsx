"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { m } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useAdminAuth } from "@/lib/stores/admin-auth-store";
import { Button } from "@/components/ui/button";
import { H1, Body } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";

/**
 * Admin Login Page
 * 
 * Premium login interface for admin dashboard access.
 */
export default function AdminLoginPage(): JSX.Element {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    console.log('[LoginPage] Form submitted');
    setError("");
    setLoading(true);

    try {
      // Clear any stale cache/storage before login
      if (typeof window !== 'undefined') {
        // Clear localStorage
        try {
          localStorage.removeItem('admin-auth-storage');
        } catch (e) {
          console.warn('[LoginPage] Could not clear localStorage:', e);
        }
        
        // Clear all admin-token cookies (various paths/domains)
        document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'admin-token=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'admin-token=; path=/; domain=' + window.location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

      // Trim email and password to avoid whitespace issues
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      console.log('[LoginPage] Attempting login with email:', trimmedEmail);

      if (!trimmedEmail || !trimmedPassword) {
        setError("Please enter both email and password.");
        setLoading(false);
        return;
      }

      if (!login) {
        console.error('[LoginPage] Login function is undefined!');
        setError("Login system error. Please refresh the page and try again.");
        setLoading(false);
        return;
      }

      const success = await login(trimmedEmail, trimmedPassword);
      
      console.log('[LoginPage] Login result:', success);
      
      if (success) {
        console.log('[LoginPage] Login successful, preparing redirect...');
        
        // Clear loading state before redirect
        setLoading(false);
        
        // CRITICAL: Wait longer to ensure:
        // 1. Server cookie is fully set (httpOnly cookie from server response)
        // 2. Zustand state is persisted to localStorage
        // 3. Browser has processed the Set-Cookie header
        // Use window.location instead of router.push for a full page reload
        // This ensures middleware can read the cookie properly
        setTimeout(() => {
          console.log('[LoginPage] Redirecting to admin dashboard...');
          // Use window.location for full page reload to ensure cookie is available
          window.location.href = "/admin";
        }, 300);
      } else {
        console.log('[LoginPage] Login failed - invalid credentials');
        setError("Invalid email or password. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      // Get the actual error message
      console.error('[LoginPage] Login error:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Login failed. Please check your credentials and try again.";
      
      setError(errorMessage);
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
              Admin Dashboard
            </H1>
            <Body className="text-cream-100/80 text-sm">
              Secure admin access
            </Body>
          </div>

          {/* Login Form */}
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

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-charcoal-900 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                placeholder="admin@extremedeptkidz.com"
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-charcoal-900 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-navy-900 border-cream-300 rounded focus:ring-navy-500"
                />
                <span className="text-sm text-charcoal-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => router.push('/admin/forgot-password')}
                className="text-sm text-navy-900 hover:text-navy-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading || !email.trim() || !password.trim()}
              onClick={(e) => {
                // Ensure form submission is handled by React
                if (!email.trim() || !password.trim()) {
                  e.preventDefault();
                  setError("Please enter both email and password.");
                }
              }}
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </Button>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-charcoal-600 pt-4 border-t border-cream-200">
              <Lock className="w-4 h-4" />
              <span>Secure admin access</span>
            </div>

            {/* Development Credentials Hint */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 p-4 bg-navy-50 rounded-lg border border-navy-200">
                <p className="text-xs font-semibold text-navy-900 mb-2">
                  Development Credentials:
                </p>
                <div className="text-xs text-navy-700 space-y-1">
                  <p>Super Admin: admin@extremedeptkidz.com / Admin123!</p>
                  <p>Manager: manager@extremedeptkidz.com / Manager123!</p>
                  <p>Editor: editor@extremedeptkidz.com / Editor123!</p>
                </div>
              </div>
            )}
          </form>
        </m.div>
      </Container>
    </div>
  );
}
