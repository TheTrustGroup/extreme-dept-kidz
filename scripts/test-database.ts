/**
 * Test Database Connection
 *
 * Verifies DATABASE_URL and runs a simple query.
 * Run with: npm run test-db
 */

import { config } from 'dotenv';
import { resolve } from 'path';

try {
  config({ path: resolve(process.cwd(), '.env.local') });
} catch {}
try {
  config({ path: resolve(process.cwd(), '.env') });
} catch {}

import { getPrisma } from '../lib/db/prisma';

async function main() {
  console.log('🔍 Testing database connection...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Add it to .env.local');
    process.exit(1);
  }
  console.log('✅ DATABASE_URL is set');

  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client could not be initialized.');
    process.exit(1);
  }
  console.log('✅ Prisma client initialized\n');

  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query OK:', result);

    const adminCount = await prisma.adminUser.count();
    console.log(`✅ AdminUser count: ${adminCount}\n`);
    console.log('🎉 Database connection OK.');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Query failed:', msg);
    if (msg.includes('authentication')) {
      console.error('💡 Check DATABASE_URL password in Supabase → Settings → Database');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
