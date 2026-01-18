/**
 * Cleanup and Create Fresh Admin User
 * 
 * This script:
 * 1. Deletes ALL existing admin users
 * 2. Creates a fresh admin user with info@extremedeptkidz.com
 * 3. Sets up with super_admin role
 * 
 * Run with: npx tsx scripts/cleanup-and-create-admin.ts
 */

// Load environment variables from .env.local if it exists
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env.local file (silently fail if it doesn't exist)
try {
  config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  // .env.local might not exist, that's okay
}

// Also try .env as fallback
try {
  config({ path: resolve(process.cwd(), '.env') });
} catch (error) {
  // .env might not exist, that's okay
}

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables.');
  console.error('   Make sure .env.local exists and contains DATABASE_URL');
  process.exit(1);
}

// Import after environment is loaded
import { getPrisma } from '../lib/db/prisma';
import { hashPassword } from '../lib/auth/password';

const ADMIN_EMAIL = 'info@extremedeptkidz.com';
const ADMIN_NAME = 'Admin User';
const ADMIN_PASSWORD = 'Admin123!@#'; // CHANGE THIS AFTER FIRST LOGIN!

async function main() {
  let prisma: ReturnType<typeof getPrisma> = null;
  
  try {
    // Get Prisma client (will initialize if DATABASE_URL is set)
    prisma = getPrisma();
    
    if (!prisma) {
      console.error('❌ Prisma client not available.');
      console.error('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set');
      console.error('   Please check your .env.local file contains DATABASE_URL');
      process.exit(1);
    }

    console.log('🧹 Starting cleanup and admin creation...\n');

    // Step 1: Delete all existing admin users
    console.log('📋 Step 1: Deleting all existing admin users...');
    const deleteResult = await prisma.adminUser.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} admin user(s)\n`);

    // Step 2: Create fresh admin user
    console.log('📋 Step 2: Creating fresh admin user...');
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    
    // Check what enum type the column is actually using
    const columnCheck = await prisma.$queryRaw<Array<{ udt_name: string }>>`
      SELECT udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'AdminUser' AND column_name = 'role'
    `;
    
    const enumType = columnCheck[0]?.udt_name || 'AdminRole_new';
    console.log(`   Column is using enum type: ${enumType}`);
    
    // Generate ID (cuid format)
    const { randomBytes } = await import('crypto');
    const id = randomBytes(16).toString('hex').substring(0, 25);
    
    // Use raw SQL with all required fields and proper enum casting
    const sql = `INSERT INTO "AdminUser" (
      "id",
      "email",
      "name",
      "passwordHash",
      "role",
      "isActive"
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      'super_admin'::"${enumType}",
      true
    ) RETURNING id, email, name, role, "isActive", "createdAt"`;
    
    const result = await prisma.$queryRawUnsafe<Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
    }>>(sql, id, ADMIN_EMAIL, ADMIN_NAME, passwordHash);
    
    const insertResult = await prisma.$queryRawUnsafe<Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
      createdAt: Date;
    }>>(sql, id, ADMIN_EMAIL, ADMIN_NAME, passwordHash);
    
    const admin = insertResult[0];
    
    if (!admin) {
      throw new Error('Failed to create admin user - no result returned');
    }

    console.log('✅ Admin user created successfully!\n');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    console.log('\n⚠️  IMPORTANT: Default password is:', ADMIN_PASSWORD);
    console.log('⚠️  CHANGE THIS PASSWORD IMMEDIATELY after first login!\n');

    // Step 3: Verify
    console.log('📋 Step 3: Verifying...');
    const count = await prisma.adminUser.count();
    console.log(`✅ Total admin users: ${count}`);
    
    if (count === 1) {
      console.log('✅ Cleanup successful! Only one admin user exists.\n');
    } else {
      console.warn(`⚠️  Warning: Expected 1 admin user, found ${count}\n`);
    }

    console.log('🎉 Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to /admin/login');
    console.log(`2. Login with: ${ADMIN_EMAIL}`);
    console.log(`3. Password: ${ADMIN_PASSWORD}`);
    console.log('4. CHANGE YOUR PASSWORD IMMEDIATELY!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

main();
