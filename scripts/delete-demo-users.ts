/**
 * Delete Demo Warehouse Role Users
 * 
 * Removes the display-only demo users created by seed-warehouse-role-users.ts:
 * - manager@extremedeptkidz.com
 * - cashier@extremedeptkidz.com
 * - warehouse@extremedeptkidz.com
 * - driver@extremedeptkidz.com
 * - viewer@extremedeptkidz.com
 * 
 * Usage: npx tsx scripts/delete-demo-users.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

const cwd = process.cwd();
try {
  config({ path: resolve(cwd, '.env') });
} catch {
  /* ignore */
}
try {
  config({ path: resolve(cwd, '.env.local'), override: true });
} catch {
  /* ignore */
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_USER_EMAILS = [
  'manager@extremedeptkidz.com',
  'cashier@extremedeptkidz.com',
  'warehouse@extremedeptkidz.com',
  'driver@extremedeptkidz.com',
  'viewer@extremedeptkidz.com',
];

async function main(): Promise<void> {
  console.log('🗑️  Deleting demo warehouse role users...\n');

  let deletedCount = 0;
  let notFoundCount = 0;

  for (const email of DEMO_USER_EMAILS) {
    try {
      const result = await prisma.adminUser.deleteMany({
        where: { email },
      });

      if (result.count > 0) {
        console.log(`  ✅ Deleted: ${email}`);
        deletedCount += result.count;
      } else {
        console.log(`  ⚠️  Not found: ${email}`);
        notFoundCount++;
      }
    } catch (error) {
      console.error(`  ❌ Error deleting ${email}:`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Deleted: ${deletedCount} user(s)`);
  console.log(`   Not found: ${notFoundCount} user(s)`);
  console.log(`\n✅ Demo users cleanup complete!`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
