"use client";

import * as React from "react";
import { WifiOff, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { H2, Body } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";

interface NetworkErrorProps {
  /** Error message */
  message?: string;
  /** On retry callback */
  onRetry?: () => void;
  /** Show back to home link */
  showHomeLink?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * NetworkError Component
 * 
 * Displays offline/network error message with retry option.
 */
export function NetworkError({
  message = "You appear to be offline",
  onRetry,
  showHomeLink = true,
  className,
}: NetworkErrorProps): JSX.Element {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);

    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleRetry = (): void => {
    if (isOnline && onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center min-h-[400px]",
        theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50",
        className
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4",
          theme === "dark"
            ? "bg-yellow-900/20 text-yellow-400"
            : "bg-yellow-50 text-yellow-600"
        )}
      >
        <WifiOff className="w-8 h-8" />
      </div>

      <H2 className={cn(
        "mb-2 text-xl",
        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
      )}>
        {isOnline ? "Connection Error" : "You're Offline"}
      </H2>

      <Body className={cn(
        "mb-6 max-w-md",
        theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
      )}>
        {isOnline
          ? message || "Unable to connect to the server. Please check your connection and try again."
          : "Please check your internet connection and try again."}
      </Body>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="primary" onClick={handleRetry} className="min-w-[120px]">
          <RefreshCw className="w-4 h-4 mr-2" />
          {isOnline ? "Retry" : "Reload Page"}
        </Button>
        {showHomeLink && (
          <Button variant="secondary" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        )}
      </div>

      {!isOnline && (
        <Body className={cn(
          "mt-4 text-xs",
          theme === "dark" ? "text-dark-text-muted" : "text-charcoal-500"
        )}>
          Your device appears to be offline. Some features may not be available.
        </Body>
      )}
    </div>
  );
}
