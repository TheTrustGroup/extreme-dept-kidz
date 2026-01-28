/**
 * Fix Product Visibility - Run this to ensure products show on website
 * 
 * This script:
 * 1. Ensures "boys" and "girls" categories exist and are active
 * 2. Assigns products to "boys" category if they're not in boys/girls
 * 3. Creates default variants for products missing variants
 * 4. Outputs what was fixed
 * 
 * Run: npm run fix-visibility (or tsx scripts/fix-product-visibility-now.ts)
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

async function fixProductVisibility() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available.');
    process.exit(1);
  }

  try {
    console.log('🔧 FIXING PRODUCT VISIBILITY\n');
    console.log('='.repeat(70));

    // Ensure boys category exists
    const boysCategory = await prisma.category.upsert({
      where: { slug: 'boys' },
      update: {
        isActive: true,
        name: 'Boys',
        description: 'Premium streetwear for young legends',
      },
      create: {
        name: 'Boys',
        slug: 'boys',
        description: 'Premium streetwear for young legends',
        isActive: true,
      },
    });
    console.log('✅ Boys category:', boysCategory.id);

    // Ensure girls category exists
    const girlsCategory = await prisma.category.upsert({
      where: { slug: 'girls' },
      update: {
        isActive: true,
        name: 'Girls',
        description: 'Select premium styles for girls',
      },
      create: {
        name: 'Girls',
        slug: 'girls',
        description: 'Select premium styles for girls',
        isActive: true,
      },
    });
    console.log('✅ Girls category:', girlsCategory.id);

    // Get all products
    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
    });

    console.log(`\n📦 Found ${products.length} products\n`);

    let assigned = 0;
    let variantsCreated = 0;

    for (const product of products) {
      const slug = product.category?.slug;
      const isBoysOrGirls = slug === 'boys' || slug === 'girls';

      // Assign to boys if not in boys/girls
      if (!isBoysOrGirls) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: boysCategory.id },
        });
        console.log(`  ✅ Assigned "${product.name}" to Boys category`);
        assigned++;
      }

      // Create default variant if missing
      if (product.variants.length === 0) {
        const sku = product.sku
          ? `${product.sku}-OS`
          : `SKU-${product.id.slice(0, 8)}-OS`;
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: 'One Size',
            sku,
            stock: 10,
            price: product.price,
          },
        });
        console.log(`  ✅ Created variant for "${product.name}"`);
        variantsCreated++;
      }
    }

    // Count visible products
    const visibleInBoys = await prisma.product.count({
      where: { categoryId: boysCategory.id },
    });
    const visibleInGirls = await prisma.product.count({
      where: { categoryId: girlsCategory.id },
    });

    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY:');
    console.log(`  Products in Boys: ${visibleInBoys}`);
    console.log(`  Products in Girls: ${visibleInGirls}`);
    console.log(`  Products assigned to Boys: ${assigned}`);
    console.log(`  Variants created: ${variantsCreated}`);
    console.log('\n✅ Product visibility fixed!');
    console.log('\n⚠️  IMPORTANT: Update Vercel DATABASE_URL to use port 6543 (Transaction mode)');
    console.log('   Current (wrong): ...pooler.supabase.com:5432/...');
    console.log('   Correct:         ...pooler.supabase.com:6543/...');
    console.log('\n   Then redeploy and products will show on the website.');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixProductVisibility();
