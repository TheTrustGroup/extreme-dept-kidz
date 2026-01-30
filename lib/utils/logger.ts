/**
 * Production-safe logging utility
 * Only logs in development or when explicitly enabled
 * Includes request ID tracking for better debugging
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.ENABLE_LOGGING === 'true';

/**
 * Get request ID from headers (if available)
 */
function getRequestId(): string | undefined {
  // In Next.js API routes, we can access headers via AsyncLocalStorage or pass it explicitly
  // For now, we'll extract it from the first argument if it's a request object
  return undefined; // Will be populated by API routes that pass requestId
}

/**
 * Format log message with request ID
 */
function formatLogMessage(args: any[], requestId?: string): any[] {
  if (requestId) {
    return [`[${requestId}]`, ...args];
  }
  return args;
}

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      const requestId = getRequestId();
      console.log(...formatLogMessage(args, requestId));
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      const requestId = getRequestId();
      console.warn(...formatLogMessage(args, requestId));
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      const requestId = getRequestId();
      console.info(...formatLogMessage(args, requestId));
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    const requestId = getRequestId();
    console.error(...formatLogMessage(args, requestId));
  },
  debug: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      const requestId = getRequestId();
      console.debug(...formatLogMessage(args, requestId));
    }
  },
  // Helper to create a logger with a specific request ID
  withRequestId: (requestId: string) => ({
    log: (...args: any[]) => {
      if (isDevelopment || isDebugEnabled) {
        console.log(`[${requestId}]`, ...args);
      }
    },
    warn: (...args: any[]) => {
      if (isDevelopment || isDebugEnabled) {
        console.warn(`[${requestId}]`, ...args);
      }
    },
    info: (...args: any[]) => {
      if (isDevelopment || isDebugEnabled) {
        console.info(`[${requestId}]`, ...args);
      }
    },
    error: (...args: any[]) => {
      console.error(`[${requestId}]`, ...args);
    },
    debug: (...args: any[]) => {
      if (isDevelopment || isDebugEnabled) {
        console.debug(`[${requestId}]`, ...args);
      }
    },
  }),
};
