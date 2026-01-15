/**
 * Set New Admin User - Final Comprehensive Script
 * 
 * This script:
 * 1. Removes ALL existing admin users
 * 2. Creates the new admin user with exact credentials: Admin@extremedeptkidz.com / VisionaryIntro
 * 3. Verifies the user was created correctly
 * 4. Tests password verification
 * 5. Provides SQL for manual database update
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

// New admin credentials - EXACT as specified
const NEW_ADMIN_EMAIL = 'Admin@extremedeptkidz.com'; // Case-sensitive as specified
const NEW_ADMIN_PASSWORD = 'VisionaryIntro';
const NEW_ADMIN_NAME = 'Super Admin';

async function main() {
  console.log('🔐 Setting New Admin Credentials - Final');
  console.log('========================================\n');

  try {
    // Step 1: Delete ALL existing admin users
    console.log('📋 Step 1: Removing all existing admin users...');
    const deleteResult = await prisma.adminUser.deleteMany({});
    console.log(`   ✅ Deleted ${deleteResult.count} admin user(s)\n`);

    // Step 2: Generate password hash
    console.log('🔑 Step 2: Generating password hash...');
    const passwordHash = await hashPassword(NEW_ADMIN_PASSWORD);
    console.log(`   ✅ Password hash generated: ${passwordHash.substring(0, 30)}...\n`);

    // Step 3: Create new admin user with EXACT email (case-sensitive)
    console.log('👤 Step 3: Creating new admin user...');
    console.log(`   Email: ${NEW_ADMIN_EMAIL} (exact case)`);
    console.log(`   Name: ${NEW_ADMIN_NAME}`);
    console.log(`   Role: super_admin\n`);

    const adminUser = await prisma.adminUser.create({
      data: {
        email: NEW_ADMIN_EMAIL, // Store exactly as specified (case-sensitive)
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
      where: { email: NEW_ADMIN_EMAIL },
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
    console.log(`   Password Hash: ${verifiedUser.passwordHash.substring(0, 30)}...\n`);

    // Step 5: Test password verification
    console.log('🧪 Step 5: Testing password verification...');
    const passwordValid = await verifyPassword(NEW_ADMIN_PASSWORD, verifiedUser.passwordHash);
    
    if (!passwordValid) {
      throw new Error('❌ Password verification failed!');
    }

    console.log('   ✅ Password verification successful\n');

    // Step 6: Verify case-insensitive lookup works
    console.log('🔍 Step 6: Testing case-insensitive email lookup...');
    const lowerCaseEmail = NEW_ADMIN_EMAIL.toLowerCase();
    const foundUser = await prisma.adminUser.findMany({
      where: { isActive: true },
    });
    const caseInsensitiveMatch = foundUser.find(u => u.email.toLowerCase() === lowerCaseEmail);
    
    if (!caseInsensitiveMatch) {
      console.warn('   ⚠️  Case-insensitive lookup test failed (but exact match works)');
    } else {
      console.log('   ✅ Case-insensitive lookup works\n');
    }

    // Step 7: Final summary
    console.log('🎉 SUCCESS! New admin user is ready');
    console.log('====================================');
    console.log(`Email: ${NEW_ADMIN_EMAIL}`);
    console.log(`Password: ${NEW_ADMIN_PASSWORD}`);
    console.log(`Status: ✅ Active and verified`);
    console.log(`\n📋 SQL for Manual Database Update:`);
    console.log(`\nDELETE FROM "AdminUser";`);
    console.log(`\nINSERT INTO "AdminUser" (`);
    console.log(`    "id",`);
    console.log(`    "email",`);
    console.log(`    "name",`);
    console.log(`    "passwordHash",`);
    console.log(`    "role",`);
    console.log(`    "isActive",`);
    console.log(`    "createdAt",`);
    console.log(`    "updatedAt"`);
    console.log(`) VALUES (`);
    console.log(`    gen_random_uuid()::text,`);
    console.log(`    '${NEW_ADMIN_EMAIL}',`);
    console.log(`    '${NEW_ADMIN_NAME}',`);
    console.log(`    '${passwordHash}',`);
    console.log(`    'super_admin',`);
    console.log(`    true,`);
    console.log(`    NOW(),`);
    console.log(`    NOW()`);
    console.log(`);\n`);
    console.log('⚠️  Important:');
    console.log('   - Make sure JWT_SECRET is set in your environment variables');
    console.log('   - Test login at: /admin/login');
    console.log('   - Email is case-sensitive in database but login handles both cases');
    console.log('   - If login fails, check database connection and JWT_SECRET\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
