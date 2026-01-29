"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { isValidEmail } from "@/lib/utils/validation";

interface NewsletterFormProps {
  source?: string;
  className?: string;
}

export function NewsletterForm({ source = "coming-soon", className }: NewsletterFormProps): JSX.Element {
  const { theme } = useTheme();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe. Please try again.");
      }

      setIsSuccess(true);
      setEmail("");

      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)} noValidate>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Enter your email"
          className={cn(
            "flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300",
            "font-sans text-base",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            error
              ? theme === "dark"
                ? "border-red-400/50 bg-dark-surface text-dark-text-primary focus:border-red-400 focus:ring-red-400/20"
                : "border-red-400/50 bg-white text-charcoal-900 focus:border-red-400 focus:ring-red-400/20"
              : theme === "dark"
                ? "border-dark-border-glass bg-dark-surface text-dark-text-primary focus:border-accent-primary focus:ring-accent-primary/20"
                : "border-cream-300 bg-white text-charcoal-900 focus:border-navy-900 focus:ring-navy-500/20",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={isSubmitting}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "newsletter-error" : undefined}
        />
        <Button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          variant="primary"
          size="lg"
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Notify Me"
          )}
        </Button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            id="newsletter-error"
            className="flex items-center justify-center gap-2 text-sm"
            role="alert"
          >
            <AlertCircle className={cn(
              "w-4 h-4 flex-shrink-0",
              theme === "dark" ? "text-red-400" : "text-red-600"
            )} />
            <span className={cn(
              theme === "dark" ? "text-red-400" : "text-red-600"
            )}>
              {error}
            </span>
          </m.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {isSuccess && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2 text-sm"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className={cn(
              "w-4 h-4 flex-shrink-0",
              theme === "dark" ? "text-green-400" : "text-green-600"
            )} />
            <span className={cn(
              theme === "dark" ? "text-green-400" : "text-green-600"
            )}>
              Successfully subscribed! Check your email for confirmation.
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </form>
  );
}
