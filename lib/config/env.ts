/**
 * Environment Variable Validation
 * 
 * CRITICAL SECURITY: This module validates all required environment variables
 * and fails fast if any are missing. No defaults, no fallbacks.
 * 
 * Import this module once at app initialization to ensure all required
 * environment variables are present before the app starts.
 */

/**
 * Required environment variables for production
 * Missing any of these will cause the app to crash on startup
 */
const REQUIRED_ENV_VARS = {
  // Authentication & Security
  JWT_SECRET: {
    name: 'JWT_SECRET',
    description: 'JWT signing secret (minimum 32 characters)',
    minLength: 32,
    validate: (value: string) => {
      if (value.length < 32) {
        throw new Error(`JWT_SECRET must be at least 32 characters long. Current length: ${value.length}`);
      }
    },
  },
  
  // Database
  DATABASE_URL: {
    name: 'DATABASE_URL',
    description: 'PostgreSQL database connection string',
    validate: (value: string) => {
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
      }
    },
  },
  
  // Application URLs (for production)
  NEXT_PUBLIC_SITE_URL: {
    name: 'NEXT_PUBLIC_SITE_URL',
    description: 'Public site URL (e.g., https://extremedeptkidz.com)',
    requiredInProduction: true,
    validate: (value: string) => {
      try {
        new URL(value);
      } catch {
        throw new Error('NEXT_PUBLIC_SITE_URL must be a valid URL');
      }
    },
  },
} as const;

/**
 * Optional but recommended environment variables
 */
const OPTIONAL_ENV_VARS = {
  ADMIN_PASSWORD: {
    name: 'ADMIN_PASSWORD',
    description: 'Admin password for legacy auth route (deprecated, use database auth)',
    requiredInProduction: false,
  },
  REVALIDATE_SECRET: {
    name: 'REVALIDATE_SECRET',
    description: 'Secret for cache revalidation endpoint',
    requiredInProduction: true,
  },
  RESEND_API_KEY: {
    name: 'RESEND_API_KEY',
    description: 'Resend API key for email sending',
    requiredInProduction: false,
  },
  REDIS_URL: {
    name: 'REDIS_URL',
    description: 'Redis connection URL for rate limiting',
    requiredInProduction: false,
  },
} as const;

/**
 * Validate a single environment variable
 */
function validateEnvVar(
  varName: string,
  config: {
    name: string;
    description: string;
    minLength?: number;
    requiredInProduction?: boolean;
    validate?: (value: string) => void;
  }
): void {
  const value = process.env[varName];
  const isProduction = process.env.NODE_ENV === 'production';
  const isRequired = isProduction && (config.requiredInProduction !== false);

  if (!value || value.trim() === '') {
    if (isRequired) {
      throw new Error(
        `❌ CRITICAL: Required environment variable ${varName} is missing.\n` +
        `   Description: ${config.description}\n` +
        `   Set this in Vercel → Settings → Environment Variables\n` +
        `   The application cannot start without this variable.`
      );
    }
    return; // Optional var, skip validation
  }

  // Validate minimum length if specified
  if (config.minLength && value.length < config.minLength) {
    throw new Error(
      `❌ CRITICAL: ${varName} must be at least ${config.minLength} characters long.\n` +
      `   Current length: ${value.length}\n` +
      `   Description: ${config.description}`
    );
  }

  // Run custom validation if provided
  if (config.validate) {
    try {
      config.validate(value);
    } catch (error) {
      throw new Error(
        `❌ CRITICAL: ${varName} validation failed.\n` +
        `   Error: ${error instanceof Error ? error.message : String(error)}\n` +
        `   Description: ${config.description}`
      );
    }
  }
}

/**
 * Validate all required environment variables
 * 
 * This function MUST be called at app startup.
 * It will throw an error if any required variables are missing.
 * 
 * @throws Error if any required environment variables are missing or invalid
 */
export function validateEnvironmentVariables(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('[Env] 🔍 Validating environment variables...');
  
  // Validate required variables
  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    try {
      validateEnvVar(key, config);
      console.log(`[Env] ✅ ${key}: Set and valid`);
    } catch (error) {
      console.error(`[Env] ❌ ${key}: Validation failed`);
      throw error; // Fail fast - don't continue
    }
  }
  
  // Validate optional variables (warn if missing in production)
  for (const [key, config] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      if (isProduction && config.requiredInProduction) {
        console.warn(`[Env] ⚠️  ${key}: Missing (recommended for production)`);
      }
    } else {
      console.log(`[Env] ✅ ${key}: Set`);
    }
  }
  
  console.log('[Env] ✅ All required environment variables validated');
}

/**
 * Get validated environment variable (throws if missing)
 * Use this instead of process.env directly for required vars
 */
export function getRequiredEnv(key: keyof typeof REQUIRED_ENV_VARS): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get optional environment variable (returns undefined if missing)
 */
export function getOptionalEnv(key: keyof typeof OPTIONAL_ENV_VARS): string | undefined {
  return process.env[key];
}

// Auto-validate on module import (only in Node.js runtime, not during build)
// Skip validation during build time (Next.js build process)
const isBuildTime = 
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build' ||
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SKIP_ENV_VALIDATION === 'true');

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test' && !isBuildTime) {
  try {
    validateEnvironmentVariables();
  } catch (error) {
    // In production runtime, crash immediately
    if (process.env.NODE_ENV === 'production') {
      console.error('[Env] ❌ CRITICAL: Environment validation failed. Application cannot start.');
      console.error(error);
      process.exit(1);
    }
    // In development, warn but don't crash (allows for easier setup)
    console.warn('[Env] ⚠️  Environment validation failed (development mode - continuing anyway)');
    console.warn(error);
  }
}
