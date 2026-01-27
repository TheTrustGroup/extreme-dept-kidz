/**
 * Diagnostic script to troubleshoot admin login issues
 *
 * Usage: tsx scripts/diagnose.ts [email] [password]
 * Example: tsx scripts/diagnose.ts admin@extremedeptkidz.com "Admin123!"
 */

// Load .env first, then .env.local so .env.local overrides (correct credentials)
import { config } from 'dotenv';
import { resolve } from 'path';

const cwd = process.cwd();
try {
  config({ path: resolve(cwd, '.env') });
} catch (error) {
  // .env might not exist
}
try {
  config({ path: resolve(cwd, '.env.local'), override: true });
} catch (error) {
  // .env.local might not exist
}

import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '../lib/auth/password';
import { generateToken } from '../lib/auth/jwt';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@extremedeptkidz.com';
  const password = process.argv[3] || 'Admin123!';

  console.log('🔍 Admin Login Diagnostic Tool\n');
  console.log('='.repeat(50));
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('='.repeat(50));
  console.log();

  // Step 0: Check environment variables
  console.log('0️⃣ Checking environment variables...');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    console.log('\n💡 Make sure .env.local exists and contains DATABASE_URL');
    console.log('   Example: DATABASE_URL=postgresql://user:password@host:port/database');
    process.exit(1);
  }
  console.log('✅ DATABASE_URL is set');
  console.log(`   Format: ${databaseUrl.substring(0, 30)}...`);
  console.log(`   Host: ${databaseUrl.match(/@([^:]+)/)?.[1] || 'unknown'}`);
  console.log();

  // Step 1: Check database connection
  console.log('1️⃣ Checking database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connection: SUCCESS\n');
  } catch (error: any) {
    console.error('❌ Database connection: FAILED');
    if (error?.code === 'P1000') {
      console.error('   Error Code: P1000 - Authentication failed');
      console.error('   The database password in DATABASE_URL is not valid.');
      console.log('\n📋 Get the correct connection string from Supabase:');
      console.log('   1. Go to https://supabase.com/dashboard and open your project');
      console.log('   2. Click "Settings" (gear) → "Database"');
      console.log('   3. Under "Connection string", choose "URI"');
      console.log('   4. Copy the full URI (it includes the correct password)');
      console.log('   5. Paste it into .env.local as: DATABASE_URL=<paste-here>');
      console.log('\n   If the password has special characters (!@#$% etc.), use "Transaction"');
      console.log('   pooler (port 6543) and copy that URI instead.');
      const host = databaseUrl?.match(/@([^:\/]+)/)?.[1];
      if (host) {
        console.log(`\n💡 Your host is: ${host}`);
      }
      console.log('   Update .env.local, then run: npm run diagnose');
    } else {
      console.error('   Error:', error?.message || error);
    }
    console.log('\n💡 Check your DATABASE_URL in .env.local');
    process.exit(1);
  }

  // Step 2: Check if user exists
  console.log('2️⃣ Checking if admin user exists...');
  let user;
  try {
    user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('❌ Admin user NOT FOUND');
      console.log('\n📋 To create the admin user:');
      console.log('   1. If npm run create-admin fails with "AdminRole_new", run prisma/migrations/fix_enum_name.sql in Supabase SQL Editor first.');
      console.log('   2. Then run: npm run create-admin -- ' + email.toLowerCase() + ' "YourPassword"');
      console.log('\n   Or create manually with SQL in Supabase:');
      console.log('\nFirst, generate a password hash:');
      console.log('  npm run generate-hash "YourPassword123!"');
      console.log('\nThen use the hash in this SQL:');
      console.log(`
INSERT INTO "AdminUser" (
    "id", "email", "name", "passwordHash", "role", "isActive", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    '${email.toLowerCase()}',
    'Super Admin',
    'YOUR_PASSWORD_HASH_HERE',
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
      process.exit(1);
    }

    console.log('✅ Admin user FOUND');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Password Hash: ${user.passwordHash.substring(0, 30)}...`);
    console.log();
  } catch (error) {
    console.error('❌ Error querying database:', error);
    process.exit(1);
  }

  // Step 3: Check if user is active
  console.log('3️⃣ Checking if user is active...');
  if (!user.isActive) {
    console.log('❌ User is INACTIVE');
    console.log('\n💡 Update the user in Supabase to set isActive = true');
    process.exit(1);
  }
  console.log('✅ User is active\n');

  // Step 4: Verify password
  console.log('4️⃣ Verifying password...');
  try {
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      console.log('❌ Password verification: FAILED');
      console.log('\n💡 The password hash in the database does not match the provided password.');
      console.log('\n📋 To fix this, generate a new hash and update the database:');
      console.log(`   npm run generate-hash "${password}"`);
      console.log('\nThen update the user in Supabase:');
      console.log(`
UPDATE "AdminUser"
SET "passwordHash" = 'YOUR_NEW_HASH_HERE',
    "updatedAt" = NOW()
WHERE email = '${email.toLowerCase()}';
      `);
      process.exit(1);
    }

    console.log('✅ Password verification: SUCCESS');
    console.log();
  } catch (error) {
    console.error('❌ Error verifying password:', error);
    process.exit(1);
  }

  // Step 5: Check JWT_SECRET
  console.log('5️⃣ Checking JWT_SECRET...');
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.log('⚠️  JWT_SECRET not set in environment');
    console.log('💡 Set JWT_SECRET in .env.local and Vercel environment variables');
  } else if (jwtSecret.length < 32) {
    console.log('⚠️  JWT_SECRET is too short (must be at least 32 characters)');
    console.log(`   Current length: ${jwtSecret.length}`);
  } else {
    console.log('✅ JWT_SECRET is set and valid');
    console.log(`   Length: ${jwtSecret.length} characters`);
  }
  console.log();

  // Step 6: Test JWT generation
  console.log('6️⃣ Testing JWT token generation...');
  try {
    if (!jwtSecret || jwtSecret.length < 32) {
      console.log('⚠️  Skipping JWT test (JWT_SECRET not valid)');
    } else {
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      console.log('✅ JWT token generation: SUCCESS');
      console.log(`   Token (first 50 chars): ${token.substring(0, 50)}...`);
    }
    console.log();
  } catch (error) {
    console.error('❌ JWT token generation: FAILED');
    console.error('Error:', error);
    console.log();
  }

  // Step 7: List all admin users
  console.log('7️⃣ Listing all admin users...');
  try {
    const allUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
    console.log(`✅ Found ${allUsers.length} admin user(s):`);
    allUsers.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} (${u.role}) - ${u.isActive ? 'Active' : 'Inactive'}`);
    });
    console.log();
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }

  // Summary
  console.log('='.repeat(50));
  console.log('✅ DIAGNOSTIC COMPLETE');
  console.log('='.repeat(50));
  console.log('\n📋 Summary:');
  console.log('   ✅ Database connection: Working');
  console.log('   ✅ Admin user exists');
  console.log('   ✅ User is active');
  console.log('   ✅ Password verification: Success');
  console.log('\n💡 If login still fails on Vercel:');
  console.log('   1. Check Vercel environment variables (DATABASE_URL, JWT_SECRET)');
  console.log('   2. Make sure you redeployed after setting env vars');
  console.log('   3. Check Vercel deployment logs for errors');
  console.log('   4. Visit /api/admin/auth/test on your Vercel deployment');
  console.log();
}

main()
  .catch((error) => {
    console.error('❌ Diagnostic error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
