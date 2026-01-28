/**
 * Fix Supabase Connection
 *
 * Tests DATABASE_URL and prints clear instructions when the database
 * is unreachable (e.g. Supabase project paused).
 *
 * Run: npm run fix-supabase
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
  console.log('❌ DATABASE_URL is not set.\n');
  console.log('💡 Add it to .env.local:');
  console.log('   DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres\n');
  console.log('   Get the connection string from:');
  console.log('   https://supabase.com/dashboard → your project → Settings → Database\n');
  process.exit(1);
}

import { getPrisma } from '../lib/db/prisma';

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.log('❌ Prisma client could not be initialized.\n');
    console.log('💡 Check that DATABASE_URL in .env.local is a valid PostgreSQL URI.\n');
    process.exit(1);
  }

  const url = process.env.DATABASE_URL ?? '';
  const match = url.match(/@([^/]+)/);
  const host = match ? match[1] : 'unknown';
  const projectMatch = url.match(/postgres\.([^.]+)/);
  const projectRef = projectMatch ? projectMatch[1] : '';

  console.log('🔌 Testing Supabase connection...\n');
  console.log('   Host:', host);
  if (projectRef) {
    console.log('   Project ref:', projectRef);
  }
  console.log('');

  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection: SUCCESS\n');
    console.log('   You can run: npm run ultimate-diagnostic');
    console.log('   Then: npm run ultimate-fix\n');
    await prisma.$disconnect();
    return;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log('❌ Database connection: FAILED\n');
    console.log('   Error:', msg);
    console.log('');

    if (
      msg.includes('connect') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('timeout') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('ETIMEDOUT')
    ) {
      console.log('💡 Your Supabase database is likely PAUSED.\n');
      console.log('   Quick fix:');
      console.log('   1. Open: https://supabase.com/dashboard');
      if (projectRef) {
        console.log(`   2. Or direct: https://supabase.com/dashboard/project/${projectRef}`);
      }
      console.log('   3. Click "Resume" or "Restore" for your project');
      console.log('   4. Wait ~30 seconds for the database to start');
      console.log('   5. Run again: npm run fix-supabase');
      console.log('   6. Then: npm run ultimate-fix\n');
    } else if (msg.includes('authentication') || msg.includes('password')) {
      console.log('💡 Authentication failed. Check your DATABASE_URL password.\n');
      console.log('   In Supabase: Settings → Database → Connection string');
      console.log('   Use the URI that includes the correct password.\n');
    } else {
      console.log('💡 Check DATABASE_URL in .env.local.');
      console.log('   Format: postgresql://user:password@host:port/database\n');
    }

    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
