/**
 * Retry Utility with Exponential Backoff
 * 
 * Handles transient failures for database queries and external API calls.
 * Uses exponential backoff to avoid overwhelming failing services.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: Array<string | RegExp>;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryableErrors' | 'onRetry'>> = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error, retryableErrors?: Array<string | RegExp>): boolean {
  if (!retryableErrors || retryableErrors.length === 0) {
    // Default: retry on network errors, timeouts, and transient DB errors
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('econnrefused') ||
      message.includes('etimedout') ||
      message.includes('prisma') && (message.includes('timeout') || message.includes('connection')) ||
      message.includes('p1001') || // Prisma connection error
      message.includes('p1008') || // Prisma operation timeout
      error.name === 'TimeoutError' ||
      error.name === 'NetworkError'
    );
  }

  return retryableErrors.some(pattern => {
    if (typeof pattern === 'string') {
      return error.message.toLowerCase().includes(pattern.toLowerCase());
    }
    return pattern.test(error.message);
  });
}

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'retryableErrors' | 'onRetry'>>): number {
  const delay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelayMs);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * 
 * @example
 * const result = await retry(
 *   () => prisma.product.findMany(),
 *   { maxRetries: 3, initialDelayMs: 100 }
 * );
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if error is not retryable
      if (!isRetryableError(lastError, options.retryableErrors)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        throw lastError;
      }

      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt + 1, lastError);
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Retry with timeout
 * 
 * Combines retry logic with a timeout to prevent hanging requests.
 * 
 * Note: For Prisma queries, we use Promise.race with a timeout promise
 * instead of AbortController, as Prisma doesn't support AbortSignal.
 * 
 * @example
 * const result = await retryWithTimeout(
 *   () => fetch('https://api.example.com/data'),
 *   { timeoutMs: 5000, maxRetries: 2 }
 * );
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return retry(
    async () => {
      // For Prisma queries, use Promise.race instead of AbortController
      // Prisma doesn't support AbortSignal, so we race against a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
      });

      try {
        const result = await Promise.race([fn(), timeoutPromise]);
        return result;
      } catch (error) {
        // Re-throw timeout errors as-is
        if (error instanceof Error && error.message.includes('timed out')) {
          throw error;
        }
        // Re-throw other errors
        throw error;
      }
    },
    retryOptions
  );
}

/**
 * Retry Prisma query with timeout
 * 
 * Wrapper specifically for Prisma queries with built-in timeout handling.
 */
export async function retryPrismaQuery<T>(
  queryFn: () => Promise<T>,
  options: RetryOptions & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 5000, ...retryOptions } = options;

  return retryWithTimeout(queryFn, timeoutMs, {
    maxRetries: 3,
    initialDelayMs: 100,
    ...retryOptions,
  });
}
