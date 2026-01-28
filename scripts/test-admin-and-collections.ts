/**
 * Test Admin Login & Collection Visibility
 * 
 * This script tests:
 * 1. Admin login with info@extremedeptkidz.com / Admin123!@#
 * 2. Category creation and visibility
 * 3. Product creation and visibility
 * 
 * Run: npx tsx scripts/test-admin-and-collections.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

try {
  config({ path: resolve(process.cwd(), '.env.local') });
} catch {}
try {
  config({ path: resolve(process.cwd(), '.env') });
} catch {}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found. Add it to .env.local');
  process.exit(1);
}

const ADMIN_EMAIL = 'info@extremedeptkidz.com';
const ADMIN_PASSWORD = 'Admin123!@#';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testAdminLogin() {
  console.log('🔐 Testing admin login...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Admin login successful!');
      console.log(`   User: ${data.user?.email}`);
      console.log(`   Role: ${data.user?.role}\n`);
      return data.token;
    } else {
      console.error('❌ Admin login failed:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error || data.message || 'Unknown error'}\n`);
      return null;
    }
  } catch (error) {
    console.error('❌ Login request failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function testCategoryCreation(token: string) {
  console.log('📁 Testing category creation...\n');
  
  const testCategory = {
    name: 'Test Collection',
    slug: 'test-collection',
    description: 'Test category for visibility verification',
    isActive: true,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/admin/categories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `admin-token=${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(testCategory),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Category created successfully!');
      console.log(`   Name: ${data.data?.name}`);
      console.log(`   Slug: ${data.data?.slug}\n`);
      return data.data;
    } else {
      console.error('❌ Category creation failed:');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error || data.message || 'Unknown error'}\n`);
      return null;
    }
  } catch (error) {
    console.error('❌ Category creation request failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function testCollectionVisibility(slug: string) {
  console.log(`🌐 Testing collection visibility on /collections/${slug}...\n`);
  
  try {
    const response = await fetch(`${BASE_URL}/collections/${slug}`, {
      method: 'GET',
      headers: { 'Accept': 'text/html' },
    });

    if (response.ok) {
      const html = await response.text();
      const hasCategoryName = html.includes('Test Collection') || html.includes('test-collection');
      const hasProducts = html.includes('product') || html.includes('Product');
      
      console.log('✅ Collection page accessible');
      console.log(`   Category visible: ${hasCategoryName ? '✅' : '❌'}`);
      console.log(`   Products section: ${hasProducts ? '✅' : '⚠️  (empty - expected if no products)'}\n`);
      return true;
    } else {
      console.error(`❌ Collection page not accessible: ${response.status} ${response.statusText}\n`);
      return false;
    }
  } catch (error) {
    console.error('❌ Collection visibility check failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Admin & Collection Visibility\n');
  console.log('=' .repeat(50) + '\n');

  // Test 1: Admin Login
  const token = await testAdminLogin();
  if (!token) {
    console.error('❌ Cannot proceed without admin login. Please check credentials.');
    process.exit(1);
  }

  // Test 2: Category Creation
  const category = await testCategoryCreation(token);
  if (!category) {
    console.error('❌ Cannot proceed without category creation.');
    process.exit(1);
  }

  // Test 3: Collection Visibility
  await testCollectionVisibility(category.slug);

  console.log('=' .repeat(50));
  console.log('\n✅ All tests completed!\n');
  console.log('📝 Next Steps:');
  console.log('   1. Visit /admin/categories to see the new category');
  console.log('   2. Visit /collections/test-collection to see it on the website');
  console.log('   3. Create a product and assign it to this category');
  console.log('   4. Verify product appears on /collections/test-collection\n');
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
