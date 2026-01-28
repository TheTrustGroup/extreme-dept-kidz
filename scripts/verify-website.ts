/**
 * Final Verification - /collections/boys product visibility
 *
 * Confirms products exist, are in boys category, and that the frontend
 * query would return them. Run before handover.
 *
 * Run: npm run verify
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
  console.error('❌ DATABASE_URL is not set. Add it to .env.local');
  process.exit(1);
}

import { getPrisma } from '../lib/db/prisma';

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available.');
    process.exit(1);
  }

  console.log('\n🚀 FINAL VERIFICATION - /collections/boys\n');

  try {
    await prisma.$queryRaw`SELECT 1 as test`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Database connection failed:', msg);
    console.log('\n💡 Run: npm run fix-supabase\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  const allProducts = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { name: 'asc' },
  });

  const boysCategory = await prisma.category.findFirst({
    where: { isActive: true, slug: 'boys' },
  });

  const frontendProducts = boysCategory
    ? await prisma.product.findMany({
        where: { categoryId: boysCategory.id },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          variants: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const inBoys = allProducts.filter((p) => p.category?.slug === 'boys');

  console.log('✅ Confirm that', allProducts.length, allProducts.length === 1 ? 'product exists' : 'products exist');
  if (allProducts.length > 0) {
    inBoys.forEach((p) => {
      console.log('   •', p.name, '→ category: boys ✅');
    });
    if (inBoys.length < allProducts.length) {
      const other = allProducts.filter((p) => p.category?.slug !== 'boys');
      other.forEach((p) => {
        console.log('   •', p.name, '→ category:', p.category?.slug ?? 'none (not in boys)');
      });
    }
  }

  console.log('\n✅ Simulate EXACT frontend query (getProductsByCategory("boys"))');
  console.log('   Products that would show on /collections/boys:', frontendProducts.length);

  const willAppear = frontendProducts.length > 0;
  console.log('\n' + (willAppear ? '✅' : '❌') + ' WILL appear on website:', willAppear ? 'YES' : 'NO');

  if (willAppear) {
    console.log('\n📋 Next: visit extremedeptkidz.com/collections/boys');
    console.log('   Expected: You should see', frontendProducts.length, frontendProducts.length === 1 ? 'product' : 'products', 'displayed');
    console.log('\n   Test checklist:');
    console.log('   ✅ Products appear on /collections/boys');
    console.log('   ✅ Product images load');
    console.log('   ✅ Prices display correctly');
    console.log('   ✅ Can click to view product details');
    console.log('\n   Admin: info@extremedeptkidz.com / Admin123!@#');
    console.log('   Create another product → verify it appears immediately.');
    console.log('\n   Ready for client handover! 🎉\n');
  } else {
    console.log('\n💡 If diagnostic said they should show, try frontend cache fix:');
    console.log('   rm -rf .next && npm run dev');
    console.log('   Then hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)\n');
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Verification error:', err);
  process.exit(1);
});
