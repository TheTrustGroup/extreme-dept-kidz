// Load .env.local so we use the same database as the app
import { config } from 'dotenv';
import { resolve } from 'path';

const cwd = process.cwd();
try {
  config({ path: resolve(cwd, '.env') });
} catch (error) {}
try {
  config({ path: resolve(cwd, '.env.local'), override: true });
} catch (error) {}

import { Prisma, PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || 'admin@extremedeptkidz.com').toLowerCase();
  const password = process.argv[3] || 'Admin123!';
  const name = process.argv[4] || 'Super Admin';

  console.log(`Creating admin user: ${email}`);

  const passwordHash = await hashPassword(password);

  let user: { id: string; email: string; name: string; role: string } | null = null;

  try {
    user = await prisma.adminUser.upsert({
      where: { email },
      update: {
        passwordHash,
        name,
        role: 'super_admin',
        isActive: true,
      },
      create: {
        email,
        name,
        passwordHash,
        role: 'super_admin',
        isActive: true,
      },
    });
  } catch (err: unknown) {
    const msg = String((err as { message?: string })?.message ?? '');
    if (msg.includes('AdminRole_new') || msg.includes('42804')) {
      // DB uses AdminRole_new; upsert with raw SQL and explicit cast.
      try {
        await prisma.$executeRaw(
          Prisma.sql`
            INSERT INTO "AdminUser" (
              "id", "email", "name", "passwordHash", "role", "isActive",
              "lastLoginAt", "passwordResetToken", "passwordResetExpiresAt", "passwordResetRequestedAt",
              "createdAt", "updatedAt", "displayName"
            ) VALUES (
              gen_random_uuid()::text, ${email}, ${name}, ${passwordHash}, 'super_admin'::"AdminRole_new", true,
              NULL, NULL, NULL, NULL,
              NOW(), NOW(), ${name}
            )
            ON CONFLICT ("email") DO UPDATE SET
              "passwordHash" = EXCLUDED."passwordHash",
              "name" = EXCLUDED."name",
              "role" = EXCLUDED."role",
              "isActive" = EXCLUDED."isActive",
              "updatedAt" = NOW(),
              "displayName" = EXCLUDED."displayName"
          `
        );
      } catch (insertErr: unknown) {
        const meta = (insertErr as { meta?: { code?: string } })?.meta;
        if (meta?.code === '23502') {
          const cols = await prisma.$queryRaw<
            Array<{ column_name: string; is_nullable: string }>
          >(Prisma.sql`
            SELECT column_name, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'AdminUser'
            ORDER BY ordinal_position
          `);
          console.error('\n❌ NOT NULL violation: "AdminUser" has columns that were not included in the insert.');
          console.error('   Columns in DB:', cols.map((c) => `${c.column_name} (nullable: ${c.is_nullable})`).join(', '));
        }
        throw insertErr;
      }
      user = await prisma.adminUser.findUnique({ where: { email } });
    } else {
      throw err;
    }
  }

  if (!user) {
    console.error('❌ Admin user could not be created or found.');
    process.exit(1);
  }

  console.log('✅ Admin user created successfully!');
  console.log('Email:', user.email);
  console.log('Name:', user.name);
  console.log('Role:', user.role);
  console.log('\n⚠️  Remember to set JWT_SECRET in your environment variables!');
}

main()
  .catch((error) => {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
