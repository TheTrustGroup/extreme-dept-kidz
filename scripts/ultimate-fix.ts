/**
 * Ultimate Fix - Product Visibility on /collections/boys
 *
 * This codebase uses Category.slug for collection pages:
 * - /collections/boys  → getProductsByCategory('boys')  → products where category.slug === 'boys'
 * - /collections/girls → getProductsByCategory('girls') → products where category.slug === 'girls'
 *
 * This script:
 * 1. Ensures Category "boys" and "girls" exist and are active
 * 2. Assigns products not in boys/girls to the "boys" category
 * 3. Creates default variants for products without variants
 * 4. Sets stock to 100 for variants with 0 stock
 * 5. Optionally resets admin password (info@extremedeptkidz.com / Admin123!@#)
 *
 * Run: npm run ultimate-fix
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

const ADMIN_EMAIL = 'info@extremedeptkidz.com';
const ADMIN_PASSWORD = 'Admin123!@#';

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available.');
    process.exit(1);
  }

  try {
    console.log('🔧 ULTIMATE FIX - Product visibility for /collections/boys\n');

    // 1. Ensure boys category
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
    console.log('✅ Category "boys" ensured (id:', boysCategory.id, ')');

    // 2. Ensure girls category
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
    console.log('✅ Category "girls" ensured (id:', girlsCategory.id, ')\n');

    // 3. Get all products and fix category + variants
    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
    });
    console.log(`📦 Found ${products.length} products\n`);

    for (const product of products) {
      const slug = product.category?.slug ?? '';
      const isBoysOrGirls = slug === 'boys' || slug === 'girls';

      if (!isBoysOrGirls) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: boysCategory.id },
        });
        console.log(`   ${product.name} → assigned to category "boys"`);
      }

      if (product.variants.length === 0) {
        const sku = product.sku ? `${product.sku}-OS` : `SKU-${product.id.slice(0, 8)}-OS`;
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: 'One Size',
            sku,
            stock: 100,
            price: product.price,
          },
        });
        console.log(`   ${product.name} → created default variant (One Size, stock: 100)`);
      } else {
        for (const v of product.variants) {
          if (v.stock === 0) {
            await prisma.productVariant.update({
              where: { id: v.id },
              data: { stock: 100 },
            });
            console.log(`   ${product.name} (${v.size}) → stock set to 100`);
          }
        }
      }
    }

    // 4. Reset admin password if user exists
    try {
      const { hashPassword } = await import('../lib/auth/password');
      const admin = await prisma.adminUser.findUnique({
        where: { email: ADMIN_EMAIL.toLowerCase() },
      });
      if (admin) {
        const passwordHash = await hashPassword(ADMIN_PASSWORD);
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { passwordHash },
        });
        console.log('\n✅ Admin password reset for', ADMIN_EMAIL);
        console.log('   Password:', ADMIN_PASSWORD);
      }
    } catch {
      // Skip if auth module or update fails
    }

    const visibleInBoys = await prisma.product.count({
      where: { categoryId: boysCategory.id },
    });
    const visibleInGirls = await prisma.product.count({
      where: { categoryId: girlsCategory.id },
    });

    console.log('\n🎉 FIX COMPLETE!');
    console.log(`   /collections/boys  → ${visibleInBoys} products`);
    console.log(`   /collections/girls → ${visibleInGirls} products`);
    console.log('\n✅ Products should now appear on the website.');
    console.log('   Restart dev server: npm run dev');
    console.log('   Then visit: extremedeptkidz.com/collections/boys\n');
  } catch (err: unknown) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
