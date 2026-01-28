/**
 * Test Collection Query
 * 
 * Tests what getProductsByCategory('boys') actually returns
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
  console.error('❌ DATABASE_URL not set. Add it to .env.local');
  process.exit(1);
}

import { getProductsByCategory } from '../lib/db';

async function test() {
  try {
    console.log('🧪 Testing getProductsByCategory("boys")\n');
    const products = await getProductsByCategory('boys');
    console.log(`✅ Found ${products.length} products\n`);
    
    if (products.length === 0) {
      console.log('❌ No products returned! This is why the site shows 0 products.\n');
      console.log('Possible causes:');
      console.log('  1. Production uses a different DATABASE_URL');
      console.log('  2. Category "boys" is not active');
      console.log('  3. Products exist but categoryId doesn\'t match');
    } else {
      products.forEach((p, i) => {
        console.log(`Product ${i + 1}:`);
        console.log(`  Name: ${p.name}`);
        console.log(`  Slug: ${p.slug}`);
        console.log(`  Category: ${p.category.name} (${p.category.slug})`);
        console.log(`  In Stock: ${p.inStock}`);
        console.log(`  Variants: ${p.sizes.length}`);
        console.log(`  Images: ${p.images.length}`);
        console.log('');
      });
    }
  } catch (err: unknown) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

test();
