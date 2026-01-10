/**
 * Generate a password hash for use in SQL INSERT statements
 * 
 * Usage: tsx scripts/generate-password-hash.ts [password]
 * Example: tsx scripts/generate-password-hash.ts MySecurePassword123!
 */

import { hashPassword } from '../lib/auth/password';

async function main() {
  const password = process.argv[2] || 'Admin123!';
  
  if (!password) {
    console.error('❌ Please provide a password');
    console.log('Usage: tsx scripts/generate-password-hash.ts [password]');
    process.exit(1);
  }

  console.log('🔐 Generating password hash...\n');
  console.log(`Password: ${password}`);
  
  const hash = await hashPassword(password);
  
  console.log(`\n✅ Password Hash:`);
  console.log(hash);
  console.log('\n📋 SQL INSERT Statement:');
  console.log(`
INSERT INTO "AdminUser" (
    "id",
    "email",
    "name",
    "passwordHash",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@extremedeptkidz.com',
    'Super Admin',
    '${hash}',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("email") DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "name" = EXCLUDED."name",
    "role" = EXCLUDED."role",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();
  `);
  console.log('\n💡 Copy the hash above and use it in your SQL INSERT statement in Supabase.');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
