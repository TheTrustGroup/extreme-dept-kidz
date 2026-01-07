/**
 * Prisma Client Singleton
 * 
 * Prevents multiple instances of Prisma Client in development
 * and ensures proper connection pooling in production.
 * 
 * Note: Prisma Client will only be initialized if DATABASE_URL is available.
 * This allows the app to build and deploy without a database connection.
 */

import type { PrismaClient as PrismaClientType } from "@prisma/client";

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
    // Dynamic import to prevent build-time evaluation
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client") as {
      PrismaClient: new (args?: { log?: string[] }) => PrismaClientType;
    };
    
    // Create new instance
    const client = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

    // Store in global for development hot-reload
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }

    return client;
  } catch (error) {
    console.warn("Prisma Client not available:", error);
    return null;
  }
}

// Export a getter function instead of direct initialization
// This prevents Prisma from initializing during build time
export const prisma: PrismaClientType | null = 
  typeof window === "undefined" ? getPrismaClient() : null;

export default prisma;

