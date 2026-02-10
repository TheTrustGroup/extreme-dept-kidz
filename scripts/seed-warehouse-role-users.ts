/**
 * Seed warehouse role users (manager, cashier, warehouse, driver, viewer).
 * Run after: npx prisma generate
 * Usage: npx tsx scripts/seed-warehouse-role-users.ts
 *
 * Creates or updates these users with password EDK-!@# (see HAND_TO_BACKEND.md):
 *   manager@extremedeptkidz.com       (role: manager)
 *   cashier@extremedeptkidz.com       (role: cashier, POS: DC/Mainstore)
 *   maintown_cashier@extremedeptkidz.com (role: cashier, POS: Main Town only)
 *   warehouse@extremedeptkidz.com     (role: warehouse)
 *   driver@extremedeptkidz.com        (role: driver)
 *   viewer@extremedeptkidz.com        (role: viewer)
 *
 * Does not modify your existing admin (e.g. super_admin) user.
 *
 * Uses raw SQL with "AdminRole_new" cast when the DB column type is AdminRole_new
 * (avoids "column \"role\" is of type \"AdminRole_new\" but expression is of type \"AdminRole\"").
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
import { hashPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

const ROLE_PASSWORD = 'EDK-!@#';

type AssignedPos = 'main_town' | 'store';

const ROLE_USERS: Array<{ email: string; name: string; role: 'manager' | 'cashier' | 'warehouse' | 'driver' | 'viewer'; assignedPos?: AssignedPos }> = [
  { email: 'manager@extremedeptkidz.com', name: 'Manager', role: 'manager' },
  { email: 'cashier@extremedeptkidz.com', name: 'Cashier', role: 'cashier', assignedPos: 'store' },
  { email: 'maintown_cashier@extremedeptkidz.com', name: 'Maintown Cashier', role: 'cashier', assignedPos: 'main_town' },
  { email: 'warehouse@extremedeptkidz.com', name: 'Warehouse', role: 'warehouse' },
  { email: 'driver@extremedeptkidz.com', name: 'Driver', role: 'driver' },
  { email: 'viewer@extremedeptkidz.com', name: 'Viewer', role: 'viewer' },
];

/** Add new enum values to AdminRole_new (no-op if already present). */
async function ensureEnumValues(): Promise<void> {
  for (const value of ['cashier', 'warehouse', 'driver'] as const) {
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TYPE "AdminRole_new" ADD VALUE IF NOT EXISTS '${value}'`
      );
    } catch (e) {
      const msg = String((e as Error)?.message ?? '');
      if (msg.includes('does not exist')) {
        await prisma.$executeRawUnsafe(
          `ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS '${value}'`
        );
      } else {
        throw e;
      }
    }
  }
}

async function main(): Promise<void> {
  console.log('Seeding warehouse role users (password: EDK-!@#)...');
  const passwordHash = await hashPassword(ROLE_PASSWORD);

  await ensureEnumValues();

  for (const { email, name, role, assignedPos } of ROLE_USERS) {
    try {
      await prisma.adminUser.upsert({
        where: { email },
        update: { name, displayName: name, role, passwordHash, isActive: true, assignedPos: assignedPos ?? undefined },
        create: { email, name, displayName: name, passwordHash, role, isActive: true, assignedPos: assignedPos ?? undefined },
      });
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message ?? '');
      if (msg.includes('AdminRole_new') || msg.includes('42804')) {
        // DB column uses AdminRole_new; cast role in SQL (role from our constant list – safe).
        // Try with displayName first (some DBs have it from older migrations).
        const withDisplayName = `INSERT INTO "AdminUser" (
            "id", "email", "name", "passwordHash", "role", "isActive",
            "lastLoginAt", "passwordResetToken", "passwordResetExpiresAt", "passwordResetRequestedAt",
            "createdAt", "updatedAt", "displayName"
          ) VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4::"AdminRole_new", true,
            NULL, NULL, NULL, NULL,
            NOW(), NOW(), $5
          )
          ON CONFLICT ("email") DO UPDATE SET
            "name" = EXCLUDED."name",
            "passwordHash" = EXCLUDED."passwordHash",
            "role" = EXCLUDED."role",
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW(),
            "displayName" = EXCLUDED."displayName"`;
        const withoutDisplayName = `INSERT INTO "AdminUser" (
            "id", "email", "name", "passwordHash", "role", "isActive",
            "lastLoginAt", "passwordResetToken", "passwordResetExpiresAt", "passwordResetRequestedAt",
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4::"AdminRole_new", true,
            NULL, NULL, NULL, NULL,
            NOW(), NOW()
          )
          ON CONFLICT ("email") DO UPDATE SET
            "name" = EXCLUDED."name",
            "passwordHash" = EXCLUDED."passwordHash",
            "role" = EXCLUDED."role",
            "isActive" = EXCLUDED."isActive",
            "updatedAt" = NOW()`;
        try {
          await prisma.$executeRawUnsafe(withDisplayName, email, name, passwordHash, role, name);
        } catch (rawErr: unknown) {
          const rawMsg = String((rawErr as { message?: string })?.message ?? '');
          if (rawMsg.includes('displayName') || rawMsg.includes('column')) {
            await prisma.$executeRawUnsafe(withoutDisplayName, email, name, passwordHash, role);
          } else {
            throw rawErr;
          }
        }
      } else {
        throw err;
      }
    }
    console.log(`  ✓ ${email} (${role})`);
  }

  console.log('Done. GET /admin/api/me will return each user with their role.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
