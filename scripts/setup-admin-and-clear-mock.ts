/**
 * Setup Admin & Clear Mock Data
 * 
 * This script:
 * 1. Creates/updates admin user with info@extremedeptkidz.com / Admin123!@#
 * 2. Deletes all old admin users
 * 3. Clears all mock data (products, categories, collections)
 * 4. Creates clean Boys and Girls categories
 * 
 * Run: npx tsx scripts/setup-admin-and-clear-mock.ts
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
  console.error('❌ DATABASE_URL not found. Add it to .env.local');
  process.exit(1);
}

import { getPrisma } from '../lib/db/prisma';
import { hashPassword } from '../lib/auth/password';

const ADMIN_EMAIL = 'info@extremedeptkidz.com';
const ADMIN_NAME = 'Admin User';
const ADMIN_PASSWORD = 'Admin123!@#';

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available. Check DATABASE_URL.');
    process.exit(1);
  }

  try {
    console.log('🚀 Setting up admin and clearing mock data...\n');

    // Step 1: Delete all existing admin users
    console.log('📋 Step 1: Cleaning up admin users...');
    const deleteResult = await prisma.adminUser.deleteMany({});
    console.log(`   ✅ Deleted ${deleteResult.count} existing admin user(s)\n`);

    // Step 2: Create new admin user
    console.log('📋 Step 2: Creating admin user...');
    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    const columnCheck = await prisma.$queryRaw<Array<{ udt_name: string }>>`
      SELECT udt_name FROM information_schema.columns
      WHERE table_name = 'AdminUser' AND column_name = 'role'
    `;
    const enumType = columnCheck[0]?.udt_name || 'AdminRole_new';

    const { randomBytes } = await import('crypto');
    const id = randomBytes(16).toString('hex').substring(0, 25);

    const sql = `INSERT INTO "AdminUser" (
      "id", "email", "name", "passwordHash", "role", "isActive"
    ) VALUES ($1, $2, $3, $4, 'super_admin'::"${enumType}", true)
    RETURNING id, email, name, role, "isActive", "createdAt"`;

    const rows = await prisma.$queryRawUnsafe<Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
    }>>(sql, id, ADMIN_EMAIL, ADMIN_NAME, passwordHash);

    const admin = rows[0];
    if (!admin) {
      throw new Error('Insert returned no row');
    }

    console.log(`   ✅ Admin user created:`);
    console.log(`      Email: ${admin.email}`);
    console.log(`      Name: ${admin.name}`);
    console.log(`      Role: ${admin.role}\n`);

    // Step 3: Clear mock data
    console.log('📋 Step 3: Clearing mock data...');
    
    const orderItemCount = await prisma.orderItem.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const collectionCount = await prisma.collection.count();

    console.log(`   Current data: ${orderItemCount} order items, ${productCount} products, ${categoryCount} categories, ${collectionCount} collections`);

    // Delete in correct order (respecting foreign keys)
    await prisma.orderItem.deleteMany({});
    console.log('   ✅ Deleted all order items');

    await prisma.inventoryLog.deleteMany({});
    console.log('   ✅ Deleted all inventory logs');

    await prisma.productVariant.deleteMany({});
    console.log('   ✅ Deleted all product variants');

    await prisma.productImage.deleteMany({});
    console.log('   ✅ Deleted all product images');

    await prisma.productTag.deleteMany({});
    console.log('   ✅ Deleted all product tags');

    await prisma.productCollection.deleteMany({});
    console.log('   ✅ Deleted all product-collection relationships');

    await prisma.completeLookProduct.deleteMany({});
    console.log('   ✅ Deleted all complete look products');

    await prisma.completeLook.deleteMany({});
    console.log('   ✅ Deleted all complete looks');

    await prisma.product.deleteMany({});
    console.log('   ✅ Deleted all products');

    await prisma.collection.deleteMany({});
    console.log('   ✅ Deleted all collections');

    await prisma.category.deleteMany({});
    console.log('   ✅ Deleted all categories\n');

    // Step 4: Create clean categories
    console.log('📋 Step 4: Creating clean categories...');
    
    await prisma.category.upsert({
      where: { slug: 'boys' },
      update: { 
        isActive: true, 
        name: 'Boys', 
        description: 'Premium streetwear for young legends' 
      },
      create: {
        name: 'Boys',
        slug: 'boys',
        description: 'Premium streetwear for young legends',
        isActive: true,
      },
    });
    console.log('   ✅ Created category: Boys (slug: boys)');

    await prisma.category.upsert({
      where: { slug: 'girls' },
      update: { 
        isActive: true, 
        name: 'Girls', 
        description: 'Select premium styles for girls' 
      },
      create: {
        name: 'Girls',
        slug: 'girls',
        description: 'Select premium styles for girls',
        isActive: true,
      },
    });
    console.log('   ✅ Created category: Girls (slug: girls)\n');

    // Final summary
    console.log('🎉 Setup complete!\n');
    console.log('📧 Admin Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}\n`);
    console.log('📝 Next Steps:');
    console.log('   1. Login at /admin/login');
    console.log('   2. Create products in Admin → Products');
    console.log('   3. Assign products to Boys or Girls category');
    console.log('   4. Products will appear on /collections/boys and /collections/girls\n');

    const finalAdminCount = await prisma.adminUser.count();
    const finalCategoryCount = await prisma.category.count();
    console.log(`✅ Final state: ${finalAdminCount} admin user(s), ${finalCategoryCount} categories\n`);

  } catch (err: unknown) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
