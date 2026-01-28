/**
 * E-Commerce Audit
 *
 * Reports counts and basic health for products, orders, categories, etc.
 * Run with: npm run audit-ecommerce
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

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available.');
    process.exit(1);
  }

  try {
    console.log('📊 E-Commerce Audit\n');
    console.log('─'.repeat(40));

    const [categories, collections, products, variants, orders, adminUsers] =
      await Promise.all([
        prisma.category.count(),
        prisma.collection.count(),
        prisma.product.count(),
        prisma.productVariant.count(),
        prisma.order.count(),
        prisma.adminUser.count(),
      ]);

    console.log('Categories:    ', categories);
    console.log('Collections:   ', collections);
    console.log('Products:      ', products);
    console.log('Variants:      ', variants);
    console.log('Orders:        ', orders);
    console.log('Admin users:   ', adminUsers);
    console.log('─'.repeat(40));

    const pending = await prisma.order.count({ where: { status: 'PENDING' } });
    const delivered = await prisma.order.count({ where: { status: 'DELIVERED' } });
    console.log('\nOrders by status:');
    console.log('  PENDING:  ', pending);
    console.log('  DELIVERED:', delivered);

    const inStock = await prisma.product.count({ where: { inStock: true } });
    const outOfStock = await prisma.product.count({ where: { inStock: false } });
    console.log('\nProducts by stock:');
    console.log('  In stock:   ', inStock);
    console.log('  Out of stock:', outOfStock);

    console.log('\n✅ Audit complete.');
  } catch (err: unknown) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
