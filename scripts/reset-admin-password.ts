/**
 * Reset Admin Password Script
 * 
 * This script helps reset an admin user's password in the database.
 * Run with: npx tsx scripts/reset-admin-password.ts <email> <new-password>
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Usage: npx tsx scripts/reset-admin-password.ts <email> <new-password>');
    console.error('Example: npx tsx scripts/reset-admin-password.ts admin@extremedeptkidz.com Admin@2024!');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    process.exit(1);
  }

  try {
    console.log('🔍 Looking for user:', email);
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.error('❌ User not found:', normalizedEmail);
      console.log('\n📋 Available users:');
      const allUsers = await prisma.adminUser.findMany({
        select: { email: true, name: true, role: true },
      });
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.name}, ${u.role})`));
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('🔐 Hashing new password...');

    // Hash the new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    console.log('💾 Updating password in database...');

    // Update the password
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Password updated successfully!');
    console.log('\n📝 Details:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Password Hash: ${passwordHash.substring(0, 30)}...`);
    console.log(`  Hash Format: ${passwordHash.startsWith('$2') ? 'bcrypt' : 'unknown'}`);
    console.log(`  Hash Rounds: ${passwordHash.match(/\$(\d+)\$/)?.[1] || 'unknown'}`);

    // Verify the password works
    console.log('\n🔍 Verifying password...');
    const isValid = await bcrypt.compare(newPassword, passwordHash);
    
    if (isValid) {
      console.log('✅ Password verification successful!');
      console.log('\n🎉 You can now login with:');
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${newPassword}`);
    } else {
      console.error('❌ Password verification failed! This should not happen.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
