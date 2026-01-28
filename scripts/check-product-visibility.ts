/**
 * Product Visibility Diagnostic Script
 * 
 * Checks why a product might not be appearing on the website
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductVisibility(productIdOrSlug: string) {
  console.log(`\n🔍 Checking product visibility for: ${productIdOrSlug}\n`);

  try {
    // Try to find product by ID or slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: productIdOrSlug },
          { slug: productIdOrSlug },
        ],
      },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
        variants: true,
        tags: true,
      },
    });

    if (!product) {
      console.log('❌ Product not found in database!');
      console.log(`   Searched for ID or slug: ${productIdOrSlug}`);
      return;
    }

    console.log('✅ Product found:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Price: $${product.price}`);
    console.log(`   In Stock: ${product.inStock}`);
    console.log(`   Created: ${product.createdAt}`);
    console.log(`   Updated: ${product.updatedAt}`);

    // Check category
    console.log('\n📁 Category Check:');
    if (!product.category) {
      console.log('❌ Product has NO category assigned!');
      console.log('   → Product will NOT appear in any collection');
    } else {
      console.log(`   Category ID: ${product.category.id}`);
      console.log(`   Category Name: ${product.category.name}`);
      console.log(`   Category Slug: ${product.category.slug}`);
      console.log(`   Category Active: ${product.category.isActive ? '✅ YES' : '❌ NO'}`);
      
      if (!product.category.isActive) {
        console.log('   ⚠️  Category is INACTIVE - product will NOT appear!');
      } else {
        console.log(`   ✅ Category is active - product should appear at /collections/${product.category.slug}`);
      }
    }

    // Check images
    console.log('\n🖼️  Images Check:');
    if (product.images.length === 0) {
      console.log('❌ Product has NO images!');
      console.log('   → Product card may not display correctly');
    } else {
      console.log(`   ✅ Found ${product.images.length} image(s):`);
      product.images.forEach((img, idx) => {
        console.log(`      ${idx + 1}. ${img.url} ${img.isPrimary ? '(PRIMARY)' : ''}`);
      });
    }

    // Check variants
    console.log('\n📦 Variants Check:');
    if (product.variants.length === 0) {
      console.log('❌ Product has NO variants!');
      console.log('   → Product may not display sizes correctly');
    } else {
      console.log(`   ✅ Found ${product.variants.length} variant(s):`);
      const activeVariants = product.variants.filter(v => v.isActive);
      const inStockVariants = product.variants.filter(v => v.stock > 0);
      console.log(`      Active: ${activeVariants.length}/${product.variants.length}`);
      console.log(`      In Stock: ${inStockVariants.length}/${product.variants.length}`);
      
      if (activeVariants.length === 0) {
        console.log('   ⚠️  No active variants - product may not display correctly');
      }
      if (inStockVariants.length === 0) {
        console.log('   ⚠️  No variants in stock - product will show as out of stock');
      }
    }

    // Check tags
    console.log('\n🏷️  Tags Check:');
    if (product.tags.length === 0) {
      console.log('   No tags assigned');
    } else {
      console.log(`   ✅ Tags: ${product.tags.map(t => t.name).join(', ')}`);
    }

    // Check where product should appear
    console.log('\n📍 Where Product Should Appear:');
    if (product.category) {
      console.log(`   ✅ /collections/${product.category.slug}`);
      
      // Check if category exists and is active
      const categoryCheck = await prisma.category.findFirst({
        where: {
          slug: product.category.slug,
          isActive: true,
        },
      });
      
      if (categoryCheck) {
        console.log(`   ✅ Category "${product.category.name}" exists and is active`);
      } else {
        console.log(`   ❌ Category "${product.category.name}" does NOT exist or is inactive`);
        console.log(`      → Product will NOT appear at /collections/${product.category.slug}`);
      }
    } else {
      console.log('   ❌ Product has no category - will not appear in collections');
    }

    // Check homepage visibility
    console.log('\n🏠 Homepage Visibility:');
    const allProducts = await prisma.product.findMany({
      where: {
        category: {
          isActive: true,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
    
    const isOnHomepage = allProducts.some(p => p.id === product.id);
    if (isOnHomepage) {
      console.log('   ✅ Product appears in recent products (may show on homepage)');
    } else {
      console.log('   ⚠️  Product is not in the most recent 20 products');
    }

    // Summary
    console.log('\n📋 Summary:');
    const issues: string[] = [];
    
    if (!product.category) {
      issues.push('❌ No category assigned');
    } else if (!product.category.isActive) {
      issues.push('❌ Category is inactive');
    }
    
    if (product.images.length === 0) {
      issues.push('❌ No images');
    }
    
    if (product.variants.length === 0) {
      issues.push('❌ No variants');
    }
    
    if (issues.length === 0) {
      console.log('   ✅ All checks passed! Product should be visible.');
      console.log(`   → Check /collections/${product.category?.slug || 'unknown'}`);
    } else {
      console.log('   ⚠️  Issues found:');
      issues.forEach(issue => console.log(`      ${issue}`));
    }

  } catch (error) {
    console.error('❌ Error checking product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get product ID or slug from command line
const productIdOrSlug = process.argv[2];

if (!productIdOrSlug) {
  console.log('Usage: npx tsx scripts/check-product-visibility.ts <product-id-or-slug>');
  console.log('Example: npx tsx scripts/check-product-visibility.ts cmkxg682z0008l1041lhi061h');
  console.log('Example: npx tsx scripts/check-product-visibility.ts my-product-slug');
  process.exit(1);
}

checkProductVisibility(productIdOrSlug);
