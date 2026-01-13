/**
 * Client-side API wrapper with robust error handling
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  [key: string]: any; // Allow additional properties
}

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Enhanced fetch with timeout, retries, and error handling
 */
export async function apiFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = 10000,
    retries = 2,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let data: ApiResponse<T>;
      
      try {
        data = await response.json();
      } catch (parseError) {
        throw new ApiError(
          'Invalid response from server',
          response.status,
          'Failed to parse JSON response'
        );
      }

      // Check response status
      if (!response.ok) {
        throw new ApiError(
          data.error || `Request failed with status ${response.status}`,
          response.status,
          data.details
        );
      }

      // Check API success flag (if present)
      if (data.success === false) {
        throw new ApiError(
          data.error || 'Request failed',
          response.status,
          data.details
        );
      }

      // Return data (handle both { data: T } and direct T responses)
      return data.data !== undefined ? data.data : (data as T);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on client errors (4xx) or abort
      if (
        error instanceof ApiError && 
        error.status && 
        error.status >= 400 && 
        error.status < 500
      ) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new ApiError('Request timeout', 408, 'The request took too long');
        throw lastError;
      }

      // Log retry attempt
      if (attempt < retries) {
        console.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}), retrying...`);
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // All retries failed
  throw lastError || new ApiError('Request failed after multiple attempts');
}

/**
 * Convenience methods
 */
export const api = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body: any, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),

  put: <T = any>(url: string, body: any, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),

  delete: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' }),
};

/**
 * User-friendly error messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Show user-friendly toast notification
 */
export function handleApiError(error: unknown, customMessage?: string): string {
  const message = customMessage || getErrorMessage(error);
  
  // Log detailed error for debugging
  console.error('API Error:', error);
  
  // Return message for caller to handle (e.g., show toast)
  return message;
}
