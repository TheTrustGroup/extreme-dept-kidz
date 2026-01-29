"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useUserAuth } from "@/lib/stores/user-auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useFocusTrap } from "@/lib/hooks/use-keyboard-navigation";
import { isValidEmail } from "@/lib/utils/validation";
import Link from "next/link";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps): JSX.Element {
  const { theme } = useTheme();
  const { login } = useUserAuth();
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Focus trap for accessibility
  useFocusTrap(modalRef, isOpen);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        onClose();
        // Reset form
        setEmail("");
        setPassword("");
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return <></>;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <m.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-in-title"
          >
            <div
              ref={modalRef}
              className={cn(
                "relative w-full max-w-md overflow-hidden rounded-xl shadow-2xl pointer-events-auto",
                theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className={cn(
                  "absolute top-4 right-4 z-10",
                  "w-10 h-10 flex items-center justify-center rounded-full",
                  "bg-white/90 backdrop-blur-sm",
                  "hover:bg-white transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-navy-500",
                  theme === "dark" && "bg-dark-surface hover:bg-dark-bg-secondary"
                )}
                aria-label="Close sign in"
              >
                <X className={cn(
                  "w-5 h-5",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )} />
              </button>

              {/* Content */}
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-6">
                  <h2
                    id="sign-in-title"
                    className={cn(
                      "text-2xl font-serif font-bold mb-2",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}
                  >
                    Sign In
                  </h2>
                  <p className={cn(
                    "text-sm",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                  )}>
                    Welcome back! Sign in to your account.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "mb-4 p-3 rounded-lg flex items-start gap-2",
                      theme === "dark" ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"
                    )}
                    role="alert"
                  >
                    <AlertCircle className={cn(
                      "w-5 h-5 flex-shrink-0 mt-0.5",
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    )} />
                    <p className={cn(
                      "text-sm",
                      theme === "dark" ? "text-red-300" : "text-red-700"
                    )}>
                      {error}
                    </p>
                  </m.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="sign-in-email"
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                        theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                      )} />
                      <input
                        id="sign-in-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-offset-2",
                          error && email.trim() === ""
                            ? theme === "dark"
                              ? "border-red-400/50 bg-dark-surface text-dark-text-primary focus:border-red-400 focus:ring-red-400/20"
                              : "border-red-400/50 bg-white text-charcoal-900 focus:border-red-400 focus:ring-red-400/20"
                            : theme === "dark"
                              ? "border-dark-border-glass bg-dark-surface text-dark-text-primary focus:border-accent-primary focus:ring-accent-primary/20"
                              : "border-cream-300 bg-white text-charcoal-900 focus:border-navy-900 focus:ring-navy-500/20",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        disabled={isLoading}
                        aria-invalid={error && email.trim() === "" ? "true" : "false"}
                        aria-describedby={error ? "sign-in-error" : undefined}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="sign-in-password"
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                        theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                      )} />
                      <input
                        id="sign-in-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={cn(
                          "w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-offset-2",
                          error && !password
                            ? theme === "dark"
                              ? "border-red-400/50 bg-dark-surface text-dark-text-primary focus:border-red-400 focus:ring-red-400/20"
                              : "border-red-400/50 bg-white text-charcoal-900 focus:border-red-400 focus:ring-red-400/20"
                            : theme === "dark"
                              ? "border-dark-border-glass bg-dark-surface text-dark-text-primary focus:border-accent-primary focus:ring-accent-primary/20"
                              : "border-cream-300 bg-white text-charcoal-900 focus:border-navy-900 focus:ring-navy-500/20",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        disabled={isLoading}
                        aria-invalid={error && !password ? "true" : "false"}
                        aria-describedby={error ? "sign-in-error" : undefined}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded",
                          "hover:bg-cream-100 transition-colors",
                          theme === "dark" && "hover:bg-dark-bg-secondary",
                          theme === "dark" ? "text-dark-text-muted hover:text-dark-text-primary" : "text-charcoal-400 hover:text-charcoal-900"
                        )}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex items-center justify-between">
                    <Link
                      href="/forgot-password"
                      onClick={onClose}
                      className={cn(
                        "text-sm font-medium transition-colors",
                        theme === "dark" ? "text-accent-primary hover:text-accent-secondary" : "text-navy-900 hover:text-navy-700"
                      )}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                    loading={isLoading}
                    loadingText="Signing in..."
                  >
                    Sign In
                  </Button>

                  {/* Sign Up Link */}
                  <div className="text-center pt-2">
                    <p className={cn(
                      "text-sm",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                    )}>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSwitchToSignUp?.();
                        }}
                        className={cn(
                          "font-semibold transition-colors",
                          theme === "dark" ? "text-accent-primary hover:text-accent-secondary" : "text-navy-900 hover:text-navy-700"
                        )}
                      >
                        Create Account
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
