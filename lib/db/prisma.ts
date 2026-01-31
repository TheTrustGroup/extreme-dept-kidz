/**
 * Prisma Client Singleton
 * 
 * Prevents multiple instances of Prisma Client in development
 * and ensures proper connection pooling in production.
 * 
 * Note: Prisma Client will only be initialized if DATABASE_URL is available.
 * This allows the app to build and deploy without a database connection.
 */

// Use a type-only import to avoid runtime evaluation
type PrismaClientType = import("@prisma/client").PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | null | undefined;
};

// Lazy initialization function - only imports Prisma when called
function getPrismaClient(): PrismaClientType | null {
  // Return null if DATABASE_URL is not set (allows build without database)
  if (!process.env.DATABASE_URL) {
    return null;
  }

  // Return existing instance if available
  if (globalForPrisma.prisma !== undefined) {
    return globalForPrisma.prisma;
  }

  try {
    // Dynamic require to prevent build-time evaluation
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client") as {
      PrismaClient: new (args?: { log?: string[] }) => PrismaClientType;
    };
    
    // Create new instance
    // Prisma reads DATABASE_URL from environment automatically.
    // For Supabase pooler (serverless/Vercel): normalize URL so connection always succeeds.
    const databaseUrl = process.env.DATABASE_URL || '';
    const isSupabasePooler = databaseUrl.includes('pooler.supabase.com');
    
    let finalDatabaseUrl = databaseUrl;
    if (isSupabasePooler) {
      // Root cause fix: Supabase pooler requires (1) pgbouncer=true and (2) sslmode=require.
      // Normalize in code so Vercel env doesn't need perfect params (avoids 500 on login).
      const hasQuery = databaseUrl.includes('?');
      const base = hasQuery ? databaseUrl.replace(/\?.*$/, '') : databaseUrl;
      const params = new URLSearchParams(hasQuery ? databaseUrl.slice(databaseUrl.indexOf('?') + 1) : '');
      params.set('pgbouncer', 'true');
      params.set('sslmode', 'require');
      finalDatabaseUrl = `${base}?${params.toString()}`;
    }
    
    const client = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn", "query"]
          : ["error"],
      // Always pass normalized URL for Supabase pooler so pgbouncer + sslmode are set
      ...(isSupabasePooler && {
        datasources: {
          db: {
            url: finalDatabaseUrl,
          },
        },
      }),
      // Configure query timeout (5 seconds for DB queries)
      // Note: Prisma doesn't have a direct timeout option, but we can use $transaction with timeout
      // For individual queries, we'll handle timeouts via retry utility
    });

    // Store in global for development hot-reload
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }

    return client;
  } catch (error) {
    // Silently fail during build - Prisma client will be null
    if (process.env.NODE_ENV !== "production") {
      console.warn("Prisma Client not available:", error);
    }
    return null;
  }
}

// Export a getter function that initializes on demand
// This ensures Prisma only initializes when actually needed and DATABASE_URL is available
export function getPrisma(): PrismaClientType | null {
  if (typeof window !== "undefined") {
    return null;
  }
  return getPrismaClient();
}

// For backward compatibility, export as a getter property
export const prisma: PrismaClientType | null = getPrisma();

export default prisma;

