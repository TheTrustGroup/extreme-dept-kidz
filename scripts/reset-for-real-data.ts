/**
 * Reset for real data – start clean, then use Admin for everything
 *
 * USE WITH CARE. This script:
 * 1. Deletes all order items (order history per product is lost)
 * 2. Deletes all products
 * 3. Deletes all categories
 * 4. Creates Boys and Girls categories (slug: boys, girls)
 *
 * After running: create products in Admin → Products and assign to Boys or Girls.
 * They will show on /collections/boys and /collections/girls.
 *
 * Run: npm run reset-for-real-data
 */

import { config } from "dotenv";
import { resolve } from "path";

try {
  config({ path: resolve(process.cwd(), ".env.local") });
} catch {}
try {
  config({ path: resolve(process.cwd(), ".env") });
} catch {}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set. Add it to .env.local");
  process.exit(1);
}

import { getPrisma } from "../lib/db/prisma";

async function reset() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error("❌ Prisma client not available.");
    process.exit(1);
  }

  try {
    console.log("⚠️  RESET FOR REAL DATA\n");
    console.log("   This will DELETE all order items, products, and categories.");
    console.log("   Then it creates Boys and Girls categories only.\n");

    const orderItemCount = await prisma.orderItem.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();

    console.log(`   Current: ${orderItemCount} order items, ${productCount} products, ${categoryCount} categories.\n`);

    await prisma.orderItem.deleteMany({});
    console.log("✅ Deleted all order items");

    await prisma.product.deleteMany({});
    console.log("✅ Deleted all products");

    await prisma.category.deleteMany({});
    console.log("✅ Deleted all categories");

    await prisma.category.upsert({
      where: { slug: "boys" },
      update: { isActive: true, name: "Boys", description: "Premium streetwear for young legends" },
      create: {
        name: "Boys",
        slug: "boys",
        description: "Premium streetwear for young legends",
        isActive: true,
      },
    });
    await prisma.category.upsert({
      where: { slug: "girls" },
      update: { isActive: true, name: "Girls", description: "Select premium styles for girls" },
      create: {
        name: "Girls",
        slug: "girls",
        description: "Select premium styles for girls",
        isActive: true,
      },
    });
    console.log("✅ Created categories: Boys (slug: boys), Girls (slug: girls)\n");
    console.log("🎉 Done. Next:");
    console.log("   1. Go to Admin → Products → New product");
    console.log("   2. Choose category Boys or Girls");
    console.log("   3. Products will show on /collections/boys and /collections/girls\n");
  } catch (err: unknown) {
    console.error("❌ Error:", err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

reset().catch((e) => {
  console.error(e);
  process.exit(1);
});
