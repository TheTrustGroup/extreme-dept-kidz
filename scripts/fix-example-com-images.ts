/**
 * One-time fix: Replace ProductImage URLs that point to example.com (placeholder)
 * with a local placeholder so thumbnails don't 404.
 *
 * Run: npx tsx scripts/fix-example-com-images.ts
 * Or with DATABASE_URL set: npx tsx scripts/fix-example-com-images.ts
 */

import { PrismaClient } from "@prisma/client";

const PLACEHOLDER_URL = "/placeholder.jpg";
const EXAMPLE_DOMAINS = ["https://example.com/", "http://example.com/"];

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Set it in .env.local or pass it when running.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const badImages = await prisma.productImage.findMany({
      where: {
        OR: EXAMPLE_DOMAINS.map((domain) => ({ url: { startsWith: domain } })),
      },
      select: { id: true, url: true, productId: true },
    });

    if (badImages.length === 0) {
      console.log("✅ No product images found with example.com URLs. Nothing to fix.");
      return;
    }

    console.log(`Found ${badImages.length} image(s) with example.com URLs:`);
    badImages.forEach((img) => console.log(`  - ${img.url} (productId: ${img.productId})`));

    const result = await prisma.productImage.updateMany({
      where: {
        OR: EXAMPLE_DOMAINS.map((domain) => ({ url: { startsWith: domain } })),
      },
      data: { url: PLACEHOLDER_URL },
    });

    console.log(`\n✅ Updated ${result.count} image(s) to ${PLACEHOLDER_URL}`);
    console.log("   Thumbnails will show the placeholder (or package icon if /placeholder.jpg is missing).");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
