/**
 * Fetch with Timeout Utility
 * 
 * Wraps fetch with AbortController for timeout handling.
 * Prevents hanging requests by enforcing maximum request duration.
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds for external APIs

/**
 * Fetch with timeout
 * 
 * Automatically aborts the request if it exceeds the timeout duration.
 * 
 * @example
 * const response = await fetchWithTimeout('https://api.example.com/data', {
 *   timeoutMs: 5000,
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    
    throw error;
  }
}

/**
 * Fetch with timeout and retry
 * 
 * Combines timeout with retry logic for resilient external API calls.
 * 
 * @example
 * const response = await fetchWithTimeoutAndRetry('https://api.example.com/data', {
 *   timeoutMs: 5000,
 *   maxRetries: 3,
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * });
 */
export async function fetchWithTimeoutAndRetry(
  url: string,
  options: FetchWithTimeoutOptions & { maxRetries?: number; initialDelayMs?: number } = {}
): Promise<Response> {
  const { maxRetries = 3, initialDelayMs = 100, ...fetchOptions } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, fetchOptions);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Don't retry on non-retryable errors (4xx client errors)
      if (lastError.message.includes('40')) {
        throw lastError;
      }

      // Wait before retry (exponential backoff)
      const delay = initialDelayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
