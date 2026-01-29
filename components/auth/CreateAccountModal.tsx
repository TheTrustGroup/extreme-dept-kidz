"use client";

import * as React from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useUserAuth } from "@/lib/stores/user-auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useFocusTrap } from "@/lib/hooks/use-keyboard-navigation";
import { isValidEmail } from "@/lib/utils/validation";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn?: () => void;
}

interface PasswordStrength {
  score: number; // 0-4
  feedback: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

function calculatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  let feedback = "";
  if (score === 0) feedback = "Very weak";
  else if (score === 1) feedback = "Weak";
  else if (score === 2) feedback = "Fair";
  else if (score === 3) feedback = "Good";
  else if (score === 4) feedback = "Strong";
  else feedback = "Very strong";

  return { score, feedback, checks };
}

export function CreateAccountModal({ isOpen, onClose, onSwitchToSignIn }: CreateAccountModalProps): JSX.Element {
  const { theme } = useTheme();
  const { signup } = useUserAuth();
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const passwordStrength = React.useMemo(() => calculatePasswordStrength(password), [password]);

  // Focus trap for accessibility
  useFocusTrap(modalRef, isOpen);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAcceptTerms(false);
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
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

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

    if (passwordStrength.score < 2) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(name, email, password);
      
      if (result.success) {
        onClose();
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAcceptTerms(false);
      } else {
        setError(result.error || "Account creation failed");
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
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-account-title"
          >
            <div
              ref={modalRef}
              className={cn(
                "relative w-full max-w-md my-8 overflow-hidden rounded-xl shadow-2xl pointer-events-auto",
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
                aria-label="Close create account"
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
                    id="create-account-title"
                    className={cn(
                      "text-2xl font-serif font-bold mb-2",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}
                  >
                    Create Account
                  </h2>
                  <p className={cn(
                    "text-sm",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                  )}>
                    Join EXTREME DEPT KIDZ and start shopping!
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
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="sign-up-name"
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                        theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                      )} />
                      <input
                        id="sign-up-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-offset-2",
                          error && name.trim() === ""
                            ? theme === "dark"
                              ? "border-red-400/50 bg-dark-surface text-dark-text-primary focus:border-red-400 focus:ring-red-400/20"
                              : "border-red-400/50 bg-white text-charcoal-900 focus:border-red-400 focus:ring-red-400/20"
                            : theme === "dark"
                              ? "border-dark-border-glass bg-dark-surface text-dark-text-primary focus:border-accent-primary focus:ring-accent-primary/20"
                              : "border-cream-300 bg-white text-charcoal-900 focus:border-navy-900 focus:ring-navy-500/20",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        disabled={isLoading}
                        aria-invalid={error && name.trim() === "" ? "true" : "false"}
                        aria-describedby={error ? "sign-up-error" : undefined}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="sign-up-email"
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
                        id="sign-up-email"
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
                        aria-describedby={error ? "sign-up-error" : undefined}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="sign-up-password"
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
                        id="sign-up-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
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
                        aria-describedby={error ? "sign-up-error" : undefined}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-xs",
                          "hover:bg-cream-100 transition-colors",
                          theme === "dark" && "hover:bg-dark-bg-secondary",
                          theme === "dark" ? "text-dark-text-muted hover:text-dark-text-primary" : "text-charcoal-400 hover:text-charcoal-900"
                        )}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={cn(
                            theme === "dark" ? "text-dark-text-muted" : "text-charcoal-600"
                          )}>
                            Password strength: <span className="font-semibold">{passwordStrength.feedback}</span>
                          </span>
                        </div>
                        <div className="flex gap-1 h-1.5">
                          {[0, 1, 2, 3, 4].map((index) => (
                            <div
                              key={index}
                              className={cn(
                                "flex-1 rounded-full transition-colors",
                                index < passwordStrength.score
                                  ? passwordStrength.score <= 2
                                    ? "bg-red-500"
                                    : passwordStrength.score === 3
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  : theme === "dark"
                                    ? "bg-dark-bg-secondary"
                                    : "bg-cream-200"
                              )}
                            />
                          ))}
                        </div>
                        <div className="space-y-1 text-xs">
                          {[
                            { check: passwordStrength.checks.length, label: "At least 8 characters" },
                            { check: passwordStrength.checks.uppercase, label: "One uppercase letter" },
                            { check: passwordStrength.checks.lowercase, label: "One lowercase letter" },
                            { check: passwordStrength.checks.number, label: "One number" },
                            { check: passwordStrength.checks.special, label: "One special character" },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              {item.check ? (
                                <CheckCircle2 className={cn(
                                  "w-3.5 h-3.5",
                                  theme === "dark" ? "text-green-400" : "text-green-600"
                                )} />
                              ) : (
                                <div className={cn(
                                  "w-3.5 h-3.5 rounded-full border-2",
                                  theme === "dark" ? "border-dark-text-muted" : "border-charcoal-300"
                                )} />
                              )}
                              <span className={cn(
                                item.check
                                  ? theme === "dark" ? "text-green-300" : "text-green-700"
                                  : theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
                              )}>
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label
                      htmlFor="sign-up-confirm-password"
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                        theme === "dark" ? "text-dark-text-muted" : "text-charcoal-400"
                      )} />
                      <input
                        id="sign-up-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className={cn(
                          "w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-colors",
                          "focus:outline-none focus:ring-2 focus:ring-offset-2",
                          error && password !== confirmPassword && confirmPassword
                            ? theme === "dark"
                              ? "border-red-400/50 bg-dark-surface text-dark-text-primary focus:border-red-400 focus:ring-red-400/20"
                              : "border-red-400/50 bg-white text-charcoal-900 focus:border-red-400 focus:ring-red-400/20"
                            : theme === "dark"
                              ? "border-dark-border-glass bg-dark-surface text-dark-text-primary focus:border-accent-primary focus:ring-accent-primary/20"
                              : "border-cream-300 bg-white text-charcoal-900 focus:border-navy-900 focus:ring-navy-500/20",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                        disabled={isLoading}
                        aria-invalid={error && password !== confirmPassword ? "true" : "false"}
                        aria-describedby={error ? "sign-up-error" : undefined}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-xs",
                          "hover:bg-cream-100 transition-colors",
                          theme === "dark" && "hover:bg-dark-bg-secondary",
                          theme === "dark" ? "text-dark-text-muted hover:text-dark-text-primary" : "text-charcoal-400 hover:text-charcoal-900"
                        )}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className={cn(
                        "mt-1 w-4 h-4 rounded border-2 transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                        theme === "dark"
                          ? "border-dark-border-glass bg-dark-surface checked:bg-accent-primary checked:border-accent-primary"
                          : "border-cream-300 bg-white checked:bg-navy-900 checked:border-navy-900",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="accept-terms"
                      className={cn(
                        "text-sm cursor-pointer",
                        theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                      )}
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms-of-service"
                        className={cn(
                          "font-semibold underline transition-colors",
                          theme === "dark" ? "text-accent-primary hover:text-accent-secondary" : "text-navy-900 hover:text-navy-700"
                        )}
                        target="_blank"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy-policy"
                        className={cn(
                          "font-semibold underline transition-colors",
                          theme === "dark" ? "text-accent-primary hover:text-accent-secondary" : "text-navy-900 hover:text-navy-700"
                        )}
                        target="_blank"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || !acceptTerms}
                    loading={isLoading}
                    loadingText="Creating account..."
                  >
                    Create Account
                  </Button>

                  {/* Sign In Link */}
                  <div className="text-center pt-2">
                    <p className={cn(
                      "text-sm",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                    )}>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSwitchToSignIn?.();
                        }}
                        className={cn(
                          "font-semibold transition-colors",
                          theme === "dark" ? "text-accent-primary hover:text-accent-secondary" : "text-navy-900 hover:text-navy-700"
                        )}
                      >
                        Sign In
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
