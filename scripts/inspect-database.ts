/**
 * Inspect Database – Products, Categories, Collections
 *
 * Shows what’s in the DB for product visibility diagnosis.
 * Schema uses: Category.slug, Category.isActive; Collection.isActive;
 * Product.categoryId, Product.inStock; ProductCollection join.
 *
 * Run: npm run inspect
 */

import { config } from 'dotenv';
import { resolve } from 'path';

try {
  config({ path: resolve(process.cwd(), '.env.local') });
} catch {}
try {
  config({ path: resolve(process.cwd(), '.env') });
} catch {}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Add it to .env.local');
  process.exit(1);
}

import { getPrisma } from '../lib/db/prisma';

async function inspect() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available.');
    process.exit(1);
  }

  try {
    console.log('🔍 DATABASE INSPECTION\n');
    console.log('='.repeat(70));

    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        variants: true,
        collections: { include: { collection: true } },
      },
    });

    console.log('\n📦 PRODUCTS:');
    console.log(`Total: ${products.length}\n`);
    products.forEach((p) => {
      console.log(`  ${p.name}`);
      console.log(`    id: ${p.id}`);
      console.log(`    slug: ${p.slug}`);
      console.log(`    inStock: ${p.inStock}`);
      console.log(`    category: ${p.category?.name} (slug: ${p.category?.slug})`);
      console.log(
        `    collections: ${p.collections.map((pc) => pc.collection?.name ?? pc.collectionId).join(', ') || 'None'}`
      );
      console.log(`    variants: ${p.variants.length}`);
      console.log(`    images: ${p.images.length}`);
      console.log('');
    });

    const categories = await prisma.category.findMany({
      include: { products: true },
    });
    console.log('\n📁 CATEGORIES:');
    console.log(`Total: ${categories.length}\n`);
    categories.forEach((c) => {
      console.log(`  ${c.name}`);
      console.log(`    slug: ${c.slug}`);
      console.log(`    isActive: ${c.isActive}`);
      console.log(`    products: ${c.products.length}`);
      console.log('');
    });

    const collections = await prisma.collection.findMany({
      include: { products: true },
    });
    console.log('\n📂 COLLECTIONS:');
    console.log(`Total: ${collections.length}\n`);
    collections.forEach((c) => {
      console.log(`  ${c.name}`);
      console.log(`    slug: ${c.slug}`);
      console.log(`    isActive: ${c.isActive}`);
      console.log(`    products (via ProductCollection): ${c.products.length}`);
      console.log('');
    });

    const boysCategory = categories.find((c) => c.slug === 'boys');
    const girlsCategory = categories.find((c) => c.slug === 'girls');
    console.log('\n📌 COLLECTION PAGE VISIBILITY (how /collections/boys and /collections/girls get products):');
    console.log(`  /collections/boys  → getProductsByCategory('boys')  → category.slug === 'boys'`);
    console.log(`  /collections/girls → getProductsByCategory('girls') → category.slug === 'girls'`);
    console.log(`  Category "boys" exists: ${boysCategory ? `yes (id: ${boysCategory.id}, ${boysCategory.products.length} products)` : 'NO'}`);
    console.log(`  Category "girls" exists: ${girlsCategory ? `yes (id: ${girlsCategory.id}, ${girlsCategory.products.length} products)` : 'NO'}`);
    console.log('');
  } catch (err: unknown) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();
