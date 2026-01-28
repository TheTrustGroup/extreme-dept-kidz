/**
 * Ultimate Diagnostic - Product Visibility on /collections/boys
 *
 * This codebase uses Category.slug for collection pages:
 * - /collections/boys  → getProductsByCategory('boys')  → products where category.slug === 'boys'
 * - /collections/girls → getProductsByCategory('girls') → products where category.slug === 'girls'
 *
 * Run: npm run ultimate-diagnostic
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { join } from 'path';

try {
  config({ path: resolve(process.cwd(), '.env.local') });
} catch {}
try {
  config({ path: resolve(process.cwd(), '.env') });
} catch {}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Add it to .env.local');
  process.exit(1);
}

import { getPrisma } from '../lib/db/prisma';

const FRONTEND_PATHS = [
  'app/collections/[slug]/page.tsx',
  'app/collections/boys/page.tsx',
  'app/(shop)/collections/[slug]/page.tsx',
];

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available.');
    process.exit(1);
  }

  const issues: string[] = [];

  console.log('\n🔌 TEST 1: DATABASE CONNECTION');
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection: SUCCESS\n');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log('❌ Database connection: FAILED');
    console.log(`   ${msg}`);
    if (msg.includes('connect') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
      console.log('\n💡 Your Supabase database may be PAUSED.');
      console.log('   Go to: https://supabase.com/dashboard → your project → Resume');
      console.log('   Then run: npm run ultimate-fix');
    }
    console.log('\n🎯 DIAGNOSTIC STOPPED (no DB connection)\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('📦 TEST 2: CATEGORIES (boys / girls)');
  const boysCategory = await prisma.category.findUnique({ where: { slug: 'boys' } });
  const girlsCategory = await prisma.category.findUnique({ where: { slug: 'girls' } });

  if (!boysCategory) {
    console.log('   ❌ Category "boys" does not exist');
    issues.push('Category "boys" missing');
  } else {
    console.log(`   ✅ Category "boys" exists (id: ${boysCategory.id})`);
    if (!boysCategory.isActive) {
      console.log('   ❌ Category "boys" is inactive (isActive: false)');
      issues.push('Category "boys" is inactive');
    } else {
      console.log('   ✅ Category "boys" is active');
    }
  }

  if (!girlsCategory) {
    console.log('   ❌ Category "girls" does not exist');
    issues.push('Category "girls" missing');
  } else {
    console.log(`   ✅ Category "girls" exists (id: ${girlsCategory.id})`);
    if (!girlsCategory.isActive) {
      console.log('   ❌ Category "girls" is inactive');
      issues.push('Category "girls" is inactive');
    } else {
      console.log('   ✅ Category "girls" is active');
    }
  }
  console.log('');

  console.log('📦 TEST 3: PRODUCTS IN DATABASE');
  const allProducts = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { name: 'asc' },
  });
  console.log(`   Total products in database: ${allProducts.length}`);

  if (allProducts.length === 0) {
    console.log('   ❌ No products found. Create products in the admin dashboard first.');
    issues.push('No products in database');
  } else {
    for (let i = 0; i < Math.min(allProducts.length, 10); i++) {
      const p = allProducts[i];
      const catSlug = p.category?.slug ?? 'none';
      const inBoysOrGirls = catSlug === 'boys' || catSlug === 'girls';
      const hasVariants = p.variants.length > 0;
      const hasStock = p.variants.some((v) => v.stock > 0) || p.variants.length === 0;

      let status = '';
      if (!inBoysOrGirls) {
        status += ' ❌ not in boys/girls';
        if (!issues.includes('Products not in boys/girls category')) {
          issues.push('Products not in boys/girls category');
        }
      } else {
        status += ' ✅ in ' + catSlug;
      }
      if (!hasVariants) {
        status += ' ❌ no variants';
        if (!issues.includes('Products without variants')) {
          issues.push('Products without variants');
        }
      } else {
        status += ' variants: ' + p.variants.length;
      }
      if (!hasStock && p.variants.length > 0) {
        status += ' ❌ out of stock';
      }

      console.log(`   ${i + 1}. "${p.name}" category: ${catSlug} ${status}`);
    }
    if (allProducts.length > 10) {
      console.log(`   ... and ${allProducts.length - 10} more`);
    }
  }
  console.log('');

  console.log('📦 TEST 4: FRONTEND QUERY SIMULATION (getProductsByCategory("boys"))');
  const categoryRecord = await prisma.category.findFirst({
    where: {
      isActive: true,
      slug: 'boys',
    },
  });

  if (!categoryRecord) {
    console.log('   ❌ No active category with slug "boys" — frontend would return 0 products.');
    if (!issues.includes('Boys category missing or inactive')) {
      issues.push('Boys category missing or inactive');
    }
  } else {
    const frontendProducts = await prisma.product.findMany({
      where: { categoryId: categoryRecord.id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`   Products that would show on /collections/boys: ${frontendProducts.length}`);
    if (frontendProducts.length === 0 && allProducts.length > 0) {
      console.log('   ❌ Products exist but none are in the "boys" category.');
      if (!issues.includes('No products in boys category')) {
        issues.push('No products in boys category');
      }
    } else if (frontendProducts.length > 0) {
      console.log('   ✅ Frontend query would return ' + frontendProducts.length + ' product(s).');
    }
  }
  console.log('');

  console.log('📂 TEST 5: FRONTEND COLLECTION PAGE');
  const cwd = process.cwd();
  const found = FRONTEND_PATHS.find((p) => existsSync(join(cwd, p)));
  if (found) {
    console.log(`   ✅ Collection page exists: ${found}`);
  } else {
    console.log('   ❌ No collection page found. Checked:');
    FRONTEND_PATHS.forEach((p) => console.log('      - ' + p));
    issues.push('Collection page file missing');
  }
  console.log('');

  console.log('🎯 DIAGNOSTIC COMPLETE');
  console.log(issues.length > 0 ? `   🚨 FOUND ${issues.length} ISSUE(S)\n` : '   ✅ NO ISSUES FOUND\n');

  if (issues.length > 0) {
    console.log('💡 QUICK FIX AVAILABLE!');
    console.log('   🔧 RUN THIS COMMAND: npm run ultimate-fix\n');
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Diagnostic error:', err);
  process.exit(1);
});
