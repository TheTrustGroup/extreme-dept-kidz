/**
 * Production-safe logging utility
 * Only logs in development or when explicitly enabled
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.ENABLE_LOGGING === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  debug: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.debug(...args);
    }
  },
};
