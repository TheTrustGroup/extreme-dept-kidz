import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@extremedeptkidz.com';
  const testPassword = 'Admin123!';

  console.log('🔍 Verifying Admin User...\n');

  try {
    // Check if user exists
    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ Admin user NOT FOUND in database');
      console.log('\n📋 To create the admin user, run this SQL in Supabase:');
      console.log(`
INSERT INTO "AdminUser" (
    "id", "email", "name", "passwordHash", "role", "isActive", "createdAt", "updatedAt"
) VALUES (
    'admin-1',
    'admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$gncCYWjmDMlxySOcf.bvvuLZbMwlCY02ogKo7CVu6AOKaRNghgsdO',
    'super_admin',
    true,
    NOW(),
    NOW()
);
      `);
      return;
    }

    console.log('✅ Admin user FOUND:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Password Hash: ${user.passwordHash.substring(0, 20)}...`);

    // Test password
    console.log('\n🔐 Testing password...');
    const isValid = await verifyPassword(testPassword, user.passwordHash);
    
    if (isValid) {
      console.log('✅ Password verification: SUCCESS');
      console.log('\n📋 Login Credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${testPassword}`);
    } else {
      console.log('❌ Password verification: FAILED');
      console.log('\n⚠️  The password hash in the database does not match "Admin123!"');
      console.log('   You may need to update the password hash in the database.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
