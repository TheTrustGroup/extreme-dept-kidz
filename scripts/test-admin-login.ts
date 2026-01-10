/**
 * Test admin login functionality
 * This script tests the login flow locally
 * 
 * Usage: tsx scripts/test-admin-login.ts
 */

import { PrismaClient } from '@prisma/client';
import { verifyPassword, hashPassword } from '../lib/auth/password';
import { generateToken, verifyToken } from '../lib/auth/jwt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Admin Login Functionality\n');
  console.log('='.repeat(60));

  const testEmail = 'admin@extremedeptkidz.com';
  const testPassword = 'Admin123!';

  // Test 1: Check database connection
  console.log('\n1️⃣ Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connection: SUCCESS');
  } catch (error) {
    console.error('❌ Database connection: FAILED');
    console.error('Error:', error);
    console.log('\n💡 Make sure DATABASE_URL is set in .env.local');
    process.exit(1);
  }

  // Test 2: Check if admin user exists
  console.log('\n2️⃣ Checking if admin user exists...');
  let user;
  try {
    user = await prisma.adminUser.findUnique({
      where: { email: testEmail.toLowerCase() },
    });

    if (!user) {
      console.log('❌ Admin user NOT FOUND');
      console.log('\n📋 Create the admin user by running this SQL in Supabase:');
      console.log('\nFirst, generate the password hash:');
      console.log('  npm run generate-hash "Admin123!"');
      console.log('\nThen use the hash in this SQL:');
      console.log(`
INSERT INTO "AdminUser" (
    "id", "email", "name", "passwordHash", "role", "isActive", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    '${testEmail.toLowerCase()}',
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
  } catch (error) {
    console.error('❌ Error querying user:', error);
    process.exit(1);
  }

  // Test 3: Check if user is active
  console.log('\n3️⃣ Checking if user is active...');
  if (!user.isActive) {
    console.log('❌ User is INACTIVE');
    console.log('\n💡 Update the user in Supabase:');
    console.log(`
UPDATE "AdminUser"
SET "isActive" = true, "updatedAt" = NOW()
WHERE email = '${testEmail.toLowerCase()}';
    `);
    process.exit(1);
  }
  console.log('✅ User is active');

  // Test 4: Test password verification
  console.log('\n4️⃣ Testing password verification...');
  try {
    const isValid = await verifyPassword(testPassword, user.passwordHash);
    
    if (!isValid) {
      console.log('❌ Password verification: FAILED');
      console.log('\n💡 The password hash in the database does not match "Admin123!"');
      console.log('\n📋 To fix:');
      console.log('1. Generate a new hash: npm run generate-hash "Admin123!"');
      console.log('2. Update the user in Supabase with the new hash');
      process.exit(1);
    }

    console.log('✅ Password verification: SUCCESS');
  } catch (error) {
    console.error('❌ Password verification error:', error);
    process.exit(1);
  }

  // Test 5: Check JWT_SECRET
  console.log('\n5️⃣ Checking JWT_SECRET...');
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

  // Test 6: Test JWT generation
  console.log('\n6️⃣ Testing JWT token generation...');
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

      // Test token verification
      const decoded = verifyToken(token);
      if (decoded && decoded.userId === user.id) {
        console.log('✅ JWT token verification: SUCCESS');
      } else {
        console.log('❌ JWT token verification: FAILED');
      }
    }
  } catch (error) {
    console.error('❌ JWT token generation: FAILED');
    console.error('Error:', error);
  }

  // Test 7: Simulate login flow
  console.log('\n7️⃣ Simulating login flow...');
  try {
    // This simulates what the login API does
    const foundUser = await prisma.adminUser.findUnique({
      where: { email: testEmail.toLowerCase() },
    });

    if (!foundUser) {
      throw new Error('User not found');
    }

    if (!foundUser.isActive) {
      throw new Error('User is inactive');
    }

    const passwordValid = await verifyPassword(testPassword, foundUser.passwordHash);
    if (!passwordValid) {
      throw new Error('Invalid password');
    }

    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error('JWT_SECRET not valid');
    }

    const loginToken = generateToken({
      userId: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
    });

    console.log('✅ Login flow simulation: SUCCESS');
    console.log('   All steps completed successfully');
    console.log(`   Generated token: ${loginToken.substring(0, 30)}...`);
  } catch (error) {
    console.error('❌ Login flow simulation: FAILED');
    console.error('Error:', error instanceof Error ? error.message : error);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('✅ Database connection: Working');
  console.log('✅ Admin user exists');
  console.log('✅ User is active');
  console.log('✅ Password verification: Working');
  if (jwtSecret && jwtSecret.length >= 32) {
    console.log('✅ JWT_SECRET: Valid');
    console.log('✅ JWT generation: Working');
  } else {
    console.log('⚠️  JWT_SECRET: Not set or invalid');
  }
  console.log('\n💡 Next steps:');
  console.log('1. Make sure DATABASE_URL is set in Vercel');
  console.log('2. Make sure JWT_SECRET is set in Vercel');
  console.log('3. Visit /api/admin/auth/diagnose on your Vercel deployment');
  console.log('4. Test login at /admin/login');
  console.log('\n📋 Login Credentials:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log();
}

main()
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
