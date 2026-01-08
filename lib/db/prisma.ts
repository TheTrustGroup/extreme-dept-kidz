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
    // Prisma 7 reads DATABASE_URL from environment automatically
    // Only pass log configuration
    const client = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
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

// Export a getter that only initializes on the server side
// This prevents Prisma from initializing during build time
export const prisma: PrismaClientType | null = 
  typeof window === "undefined" ? getPrismaClient() : null;

export default prisma;

