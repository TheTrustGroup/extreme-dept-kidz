/**
 * Fix Admin User
 *
 * Ensures a single super_admin exists (info@extremedeptkidz.com).
 * Deletes existing admin users and creates a fresh one.
 * Run with: npm run fix-admin
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
const ADMIN_PASSWORD = 'Admin123!@#'; // CHANGE AFTER FIRST LOGIN!

async function main() {
  const prisma = getPrisma();
  if (!prisma) {
    console.error('❌ Prisma client not available. Check DATABASE_URL.');
    process.exit(1);
  }

  try {
    console.log('🔧 Fixing admin user...\n');

    const deleteResult = await prisma.adminUser.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} existing admin user(s)\n`);

    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    const columnCheck = await prisma.$queryRaw<Array<{ udt_name: string }>>`
      SELECT udt_name FROM information_schema.columns
      WHERE table_name = 'AdminUser' AND column_name = 'role'
    `;
    const enumType = columnCheck[0]?.udt_name || 'AdminRole_new';

    const { randomBytes } = await import('crypto');
    const id = randomBytes(16).toString('hex').substring(0, 25);

    // Check if displayName column exists
    const displayNameCheck = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'AdminUser' AND column_name = 'displayName'
    `;
    const hasDisplayName = displayNameCheck.length > 0;

    const sql = hasDisplayName
      ? `INSERT INTO "AdminUser" (
          "id", "email", "name", "displayName", "passwordHash", "role", "isActive"
        ) VALUES ($1, $2, $3, $3, $4, 'super_admin'::"${enumType}", true)
        RETURNING id, email, name, role, "isActive", "createdAt"`
      : `INSERT INTO "AdminUser" (
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

    console.log('✅ Admin user created\n');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('\n⚠️  Default password:', ADMIN_PASSWORD);
    console.log('   Change it after first login at /admin/login\n');

    const count = await prisma.adminUser.count();
    console.log(`✅ Total admin users: ${count}`);
    console.log('\n🎉 Done.');
  } catch (err: unknown) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
