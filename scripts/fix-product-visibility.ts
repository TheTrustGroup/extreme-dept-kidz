/**
 * Fix Product Visibility for /collections/boys and /collections/girls
 *
 * This codebase uses Category.slug for collection pages:
 * - /collections/boys  → getProductsByCategory('boys')  → products where category.slug === 'boys'
 * - /collections/girls → getProductsByCategory('girls') → products where category.slug === 'girls'
 *
 * This script:
 * 1. Ensures Category "boys" and "girls" exist and are active
 * 2. Assigns products without a boys/girls category to the "boys" category
 * 3. Ensures every product has at least one variant (required for display)
 *
 * Run: npm run fix-visibility
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

async function fix() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available.');
    process.exit(1);
  }

  try {
    console.log('🔧 FIXING PRODUCT VISIBILITY\n');

    const boysCategory = await prisma.category.upsert({
      where: { slug: 'boys' },
      update: { isActive: true, name: 'Boys', description: 'Premium streetwear for young legends' },
      create: {
        name: 'Boys',
        slug: 'boys',
        description: 'Premium streetwear for young legends',
        isActive: true,
      },
    });
    console.log('✅ Category "boys" ensured (id:', boysCategory.id, ')');

    const girlsCategory = await prisma.category.upsert({
      where: { slug: 'girls' },
      update: { isActive: true, name: 'Girls', description: 'Select premium styles for girls' },
      create: {
        name: 'Girls',
        slug: 'girls',
        description: 'Select premium styles for girls',
        isActive: true,
      },
    });
    console.log('✅ Category "girls" ensured (id:', girlsCategory.id, ')\n');

    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
    });
    console.log(`📦 Found ${products.length} products\n`);

    for (const product of products) {
      const slug = product.category?.slug;
      const isBoysOrGirls = slug === 'boys' || slug === 'girls';

      if (!isBoysOrGirls) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: boysCategory.id },
        });
        console.log(`  ${product.name} → assigned to category "boys"`);
      }

      if (product.variants.length === 0) {
        const sku = product.sku ? `${product.sku}-OS` : `SKU-${product.id.slice(0, 8)}-OS`;
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: 'One Size',
            sku,
            stock: 10,
            price: product.price,
          },
        });
        console.log(`  ${product.name} → created default variant (One Size)`);
      }
    }

    const visibleInBoys = await prisma.product.count({
      where: { categoryId: boysCategory.id },
    });
    const visibleInGirls = await prisma.product.count({
      where: { categoryId: girlsCategory.id },
    });

    console.log('\n🎉 Done.');
    console.log(`   /collections/boys  → ${visibleInBoys} products`);
    console.log(`   /collections/girls → ${visibleInGirls} products`);
  } catch (err: unknown) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
