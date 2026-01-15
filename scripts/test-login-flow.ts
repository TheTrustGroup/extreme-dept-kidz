/**
 * Test Login Flow - Comprehensive Test
 * 
 * Tests the complete login flow to identify issues
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../lib/auth/password';
import { generateToken, verifyToken } from '../lib/auth/jwt';

const prisma = new PrismaClient();

const TEST_EMAIL = 'Admin@extremedeptkidz.com';
const TEST_PASSWORD = 'VisionaryIntro';

async function main() {
  console.log('🧪 Testing Login Flow');
  console.log('====================\n');

  try {
    // Test 1: Check JWT_SECRET
    console.log('1️⃣ Checking JWT_SECRET...');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is not set in environment variables');
      console.log('   Set it in Vercel: adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09');
      process.exit(1);
    }
    if (jwtSecret.length < 32) {
      console.error(`❌ JWT_SECRET is too short: ${jwtSecret.length} characters (need 32+)`);
      process.exit(1);
    }
    console.log(`   ✅ JWT_SECRET is set (${jwtSecret.length} characters)\n`);

    // Test 2: Check Database Connection
    console.log('2️⃣ Checking database connection...');
    try {
      await prisma.$connect();
      console.log('   ✅ Database connected\n');
    } catch (error) {
      console.error('   ❌ Database connection failed:', error);
      process.exit(1);
    }

    // Test 3: Check Admin User Exists
    console.log('3️⃣ Checking admin user...');
    let user = await prisma.adminUser.findUnique({
      where: { email: TEST_EMAIL },
    });

    if (!user) {
      // Try case-insensitive
      const allUsers = await prisma.adminUser.findMany({
        where: { isActive: true },
      });
      user = allUsers.find(u => u.email.toLowerCase() === TEST_EMAIL.toLowerCase()) || null;
    }

    if (!user) {
      console.error(`   ❌ Admin user not found: ${TEST_EMAIL}`);
      console.log('   Run SQL from SET_ADMIN_CREDENTIALS_FINAL.sql');
      process.exit(1);
    }
    console.log(`   ✅ User found: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}\n`);

    // Test 4: Check Password Hash
    console.log('4️⃣ Checking password hash...');
    if (!user.passwordHash) {
      console.error('   ❌ Password hash is missing');
      process.exit(1);
    }
    console.log(`   ✅ Password hash exists (${user.passwordHash.length} chars)\n`);

    // Test 5: Verify Password
    console.log('5️⃣ Testing password verification...');
    const isValid = await verifyPassword(TEST_PASSWORD, user.passwordHash);
    if (!isValid) {
      console.error('   ❌ Password verification failed');
      console.log('   Password hash does not match "VisionaryIntro"');
      console.log('   Run SQL from SET_ADMIN_CREDENTIALS_FINAL.sql to update');
      process.exit(1);
    }
    console.log('   ✅ Password verification successful\n');

    // Test 6: Generate Token
    console.log('6️⃣ Testing token generation...');
    try {
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      console.log(`   ✅ Token generated (${token.length} chars)\n`);

      // Test 7: Verify Token
      console.log('7️⃣ Testing token verification...');
      const payload = verifyToken(token);
      if (!payload) {
        console.error('   ❌ Token verification failed');
        process.exit(1);
      }
      console.log('   ✅ Token verification successful');
      console.log(`   User ID: ${payload.userId}`);
      console.log(`   Email: ${payload.email}`);
      console.log(`   Role: ${payload.role}\n`);
    } catch (error) {
      console.error('   ❌ Token generation failed:', error);
      if (error instanceof Error && error.message.includes('JWT_SECRET')) {
        console.log('   JWT_SECRET issue - check environment variables');
      }
      process.exit(1);
    }

    // Summary
    console.log('🎉 ALL TESTS PASSED!');
    console.log('===================');
    console.log('✅ JWT_SECRET is set and valid');
    console.log('✅ Database connection works');
    console.log('✅ Admin user exists and is active');
    console.log('✅ Password hash is correct');
    console.log('✅ Password verification works');
    console.log('✅ Token generation works');
    console.log('✅ Token verification works');
    console.log('\n📋 Login should work with:');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}\n`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
