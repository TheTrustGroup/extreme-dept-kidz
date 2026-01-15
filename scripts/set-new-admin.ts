/**
 * Set New Admin User - Comprehensive Reset
 * 
 * This script:
 * 1. Removes ALL existing admin users
 * 2. Creates the new admin user with specified credentials
 * 3. Verifies the user was created correctly
 * 4. Tests authentication
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

// New admin credentials
const NEW_ADMIN_EMAIL = 'Admin@extremedeptkidz.com';
const NEW_ADMIN_PASSWORD = 'VisionaryIntro';
const NEW_ADMIN_NAME = 'Super Admin';

async function main() {
  console.log('🔐 Setting New Admin Credentials');
  console.log('================================\n');

  try {
    // Step 1: Delete ALL existing admin users
    console.log('📋 Step 1: Removing all existing admin users...');
    const deleteResult = await prisma.adminUser.deleteMany({});
    console.log(`   ✅ Deleted ${deleteResult.count} admin user(s)\n`);

    // Step 2: Generate password hash
    console.log('🔑 Step 2: Generating password hash...');
    const passwordHash = await hashPassword(NEW_ADMIN_PASSWORD);
    console.log('   ✅ Password hash generated\n');

    // Step 3: Create new admin user
    console.log('👤 Step 3: Creating new admin user...');
    console.log(`   Email: ${NEW_ADMIN_EMAIL}`);
    console.log(`   Name: ${NEW_ADMIN_NAME}`);
    console.log(`   Role: super_admin\n`);

    const adminUser = await prisma.adminUser.create({
      data: {
        email: NEW_ADMIN_EMAIL.toLowerCase().trim(), // Normalize email
        name: NEW_ADMIN_NAME,
        passwordHash,
        role: 'super_admin',
        isActive: true,
      },
    });

    console.log('   ✅ Admin user created successfully!\n');

    // Step 4: Verify the user was created correctly
    console.log('✅ Step 4: Verifying admin user...');
    const verifiedUser = await prisma.adminUser.findUnique({
      where: { email: NEW_ADMIN_EMAIL.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!verifiedUser) {
      throw new Error('❌ Admin user was not created!');
    }

    if (!verifiedUser.passwordHash) {
      throw new Error('❌ Password hash is missing!');
    }

    if (!verifiedUser.isActive) {
      throw new Error('❌ Admin user is not active!');
    }

    console.log('   ✅ User verification passed');
    console.log(`   ID: ${verifiedUser.id}`);
    console.log(`   Email: ${verifiedUser.email}`);
    console.log(`   Name: ${verifiedUser.name}`);
    console.log(`   Role: ${verifiedUser.role}`);
    console.log(`   Active: ${verifiedUser.isActive}`);
    console.log(`   Password Hash: ${verifiedUser.passwordHash.substring(0, 20)}...\n`);

    // Step 5: Test password verification
    console.log('🧪 Step 5: Testing password verification...');
    const passwordValid = await verifyPassword(NEW_ADMIN_PASSWORD, verifiedUser.passwordHash);
    
    if (!passwordValid) {
      throw new Error('❌ Password verification failed!');
    }

    console.log('   ✅ Password verification successful\n');

    // Step 6: Final summary
    console.log('🎉 SUCCESS! New admin user is ready');
    console.log('====================================');
    console.log(`Email: ${NEW_ADMIN_EMAIL}`);
    console.log(`Password: ${NEW_ADMIN_PASSWORD}`);
    console.log(`Status: ✅ Active and verified`);
    console.log('\n⚠️  Important:');
    console.log('   - Make sure JWT_SECRET is set in your environment variables');
    console.log('   - Test login at: /admin/login');
    console.log('   - If login fails, check database connection and JWT_SECRET\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
