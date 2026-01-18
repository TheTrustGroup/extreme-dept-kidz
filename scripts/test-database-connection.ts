/**
 * Test Database Connection
 * 
 * Quick script to test if DATABASE_URL is working
 * Run with: npx tsx scripts/test-database-connection.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

try {
  config({ path: resolve(process.cwd(), '.env.local') });
} catch (error) {
  // .env.local might not exist
}

try {
  config({ path: resolve(process.cwd(), '.env') });
} catch (error) {
  // .env might not exist
}

import { getPrisma } from '../lib/db/prisma';

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment variables.');
    console.error('   Please add it to .env.local');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL is set');
  console.log('   Format:', process.env.DATABASE_URL.substring(0, 30) + '...');
  console.log('');

  // Try to connect
  const prisma = getPrisma();
  
  if (!prisma) {
    console.error('❌ Prisma client could not be initialized.');
    console.error('   Check DATABASE_URL format');
    process.exit(1);
  }

  console.log('✅ Prisma client initialized');
  console.log('');

  try {
    // Try a simple query
    console.log('📋 Testing database query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful!');
    console.log('   Result:', result);
    console.log('');

    // Try to count admin users
    console.log('📋 Checking AdminUser table...');
    const adminCount = await prisma.adminUser.count();
    console.log(`✅ Found ${adminCount} admin user(s) in database`);
    console.log('');

    console.log('🎉 Database connection is working!');
    console.log('');
    console.log('✅ You can now run: npm run cleanup-and-create-admin');

  } catch (error: any) {
    console.error('❌ Database query failed:');
    console.error('   Error:', error.message);
    console.error('');
    
    if (error.message.includes('authentication')) {
      console.error('💡 This is an authentication error.');
      console.error('   Your DATABASE_URL password might be incorrect.');
      console.error('   Go to Supabase → Settings → Database');
      console.error('   Reset your database password and update DATABASE_URL');
    } else if (error.message.includes('connection')) {
      console.error('💡 This is a connection error.');
      console.error('   Check your internet connection');
      console.error('   Verify Supabase project is active');
    } else {
      console.error('💡 Check your DATABASE_URL format');
      console.error('   Should be: postgresql://user:password@host:port/database');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
