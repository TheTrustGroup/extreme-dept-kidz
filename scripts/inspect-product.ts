/**
 * Inspect one product (per docs/SUPABASE-PRODUCT-VISIBILITY-DEBUG.md).
 * Run: npx tsx scripts/inspect-product.ts <productId>
 * Example: npx tsx scripts/inspect-product.ts cmkxg682z0008l1041lhi061h
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

const productId = process.argv[2] || 'cmkxg682z0008l1041lhi061h';

import { getPrisma } from '../lib/db/prisma';

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available.');
    process.exit(1);
  }

  console.log('\n🔍 INSPECT PRODUCT (per SUPABASE-PRODUCT-VISIBILITY-DEBUG.md)\n');
  console.log('Product id:', productId, '\n');

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true, variants: true, images: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
  });

  if (!product) {
    console.log('❌ Product not found. Wrong id or DB has no row.\n');
    await prisma.$disconnect();
    process.exit(1);
  }

  // §1.1 Product + category
  console.log('--- §1.1 Product + Category ---');
  console.log('id:', product.id);
  console.log('name:', product.name);
  console.log('slug:', product.slug);
  console.log('categoryId:', product.categoryId);
  console.log('price:', product.price);
  console.log('inStock:', product.inStock);
  console.log('createdAt:', product.createdAt);
  if (product.category) {
    console.log('category_slug:', product.category.slug);
    console.log('category_name:', product.category.name);
    console.log('category_active (isActive):', product.category.isActive);
  } else {
    console.log('category: NULL (no category linked)');
  }

  const slug = product.category?.slug ?? '';
  const active = product.category?.isActive ?? false;
  const inBoys = slug === 'boys' && active;
  console.log('\n→ Will show on /collections/boys?', inBoys ? 'YES' : 'NO');
  if (!inBoys) {
    if (slug !== 'boys') console.log('  Reason: category_slug is "' + slug + '" (need "boys")');
    if (!active) console.log('  Reason: category isActive is false');
  }
  console.log('');

  // §1.2 ProductVariant
  console.log('--- §1.2 ProductVariant ---');
  if (product.variants.length === 0) {
    console.log('No variants. Product needs at least one variant to render sizes.');
  } else {
    product.variants.forEach((v, i) => {
      console.log(`[${i + 1}] id:${v.id} productId:${v.productId} size:${v.size} stock:${v.stock} reserved:${v.reserved} lowStockThreshold:${v.lowStockThreshold} isActive:${v.isActive} createdAt:${v.createdAt}`);
    });
  }
  console.log('');

  // §1.3 ProductImage
  console.log('--- §1.3 ProductImage ---');
  if (product.images.length === 0) {
    console.log('No images. Product card may show placeholder or break.');
  } else {
    product.images.forEach((img, i) => {
      console.log(`[${i + 1}] id:${img.id} productId:${img.productId} url:${img.url} alt:${img.alt ?? 'null'} isPrimary:${img.isPrimary} order:${img.order} createdAt:${img.createdAt}`);
    });
  }
  console.log('');

  // Simulate getProductsByCategory('boys')
  const boysCategory = await prisma.category.findFirst({
    where: { isActive: true, slug: 'boys' },
  });
  const inBoysResult = boysCategory
    ? await prisma.product.findFirst({
        where: { id: productId, categoryId: boysCategory.id },
      })
    : null;
  console.log('--- Frontend query (getProductsByCategory("boys")) ---');
  console.log('Boys category exists & active?', !!boysCategory);
  console.log('This product in boys category?', !!inBoysResult);
  console.log('');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
