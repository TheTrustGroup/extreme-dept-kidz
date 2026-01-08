-- Seed Script for Extreme Dept Kidz Database
-- Run this in Supabase SQL Editor after running migrations

-- Clear existing data (in reverse order of dependencies)
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "InventoryLog";
DELETE FROM "ProductVariant";
DELETE FROM "ProductImage";
DELETE FROM "ProductTag";
DELETE FROM "ProductCollection";
DELETE FROM "Product";
DELETE FROM "Collection";
DELETE FROM "Category";

-- Create Categories
INSERT INTO "Category" (id, name, slug, description, image, "isActive", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'Boys', 'boys', 'Premium fashion for boys', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2086&auto=format&fit=crop', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Girls', 'girls', 'Luxury fashion for girls', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Accessories', 'accessories', 'Premium accessories and essentials', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop', true, NOW(), NOW());

-- Get category IDs for reference
DO $$
DECLARE
  boys_category_id TEXT;
  girls_category_id TEXT;
  accessories_category_id TEXT;
  new_arrivals_id TEXT;
  street_essentials_id TEXT;
  heritage_jacket_id TEXT;
  premium_tee_id TEXT;
  chino_pants_id TEXT;
  floral_dress_id TEXT;
BEGIN
  -- Get category IDs
  SELECT id INTO boys_category_id FROM "Category" WHERE slug = 'boys';
  SELECT id INTO girls_category_id FROM "Category" WHERE slug = 'girls';
  SELECT id INTO accessories_category_id FROM "Category" WHERE slug = 'accessories';

  -- Create Collections
  INSERT INTO "Collection" (id, name, slug, description, image, "isActive", "createdAt", "updatedAt")
  VALUES 
    (gen_random_uuid()::text, 'New Arrivals', 'new-arrivals', 'Discover our latest premium pieces', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop', true, NOW(), NOW()),
    (gen_random_uuid()::text, 'Street Essentials', 'street-essentials', 'Urban-inspired streetwear for modern kids', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop', true, NOW(), NOW())
  RETURNING id INTO new_arrivals_id;

  SELECT id INTO new_arrivals_id FROM "Collection" WHERE slug = 'new-arrivals';
  SELECT id INTO street_essentials_id FROM "Collection" WHERE slug = 'street-essentials';

  -- Create Products
  -- Product 1: Heritage Denim Jacket
  INSERT INTO "Product" (id, name, slug, description, price, sku, "categoryId", "inStock", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    'Heritage Denim Jacket',
    'heritage-denim-jacket',
    'A timeless statement piece crafted from premium Japanese selvedge denim. Meticulously constructed with vintage-inspired hardware and a thoughtfully designed relaxed fit.',
    12900,
    'HDJ-001',
    boys_category_id,
    true,
    NOW(),
    NOW()
  )
  RETURNING id INTO heritage_jacket_id;

  SELECT id INTO heritage_jacket_id FROM "Product" WHERE slug = 'heritage-denim-jacket';

  -- Product Images
  INSERT INTO "ProductImage" (id, "productId", url, alt, "isPrimary", "order", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    heritage_jacket_id,
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2070&auto=format&fit=crop',
    'Heritage Denim Jacket',
    true,
    0,
    NOW(),
    NOW()
  );

  -- Product Variants
  INSERT INTO "ProductVariant" (id, "productId", size, sku, stock, "createdAt", "updatedAt")
  VALUES 
    (gen_random_uuid()::text, heritage_jacket_id, '4T', 'HDJ-001-4T', 10, NOW(), NOW()),
    (gen_random_uuid()::text, heritage_jacket_id, '5T', 'HDJ-001-5T', 15, NOW(), NOW()),
    (gen_random_uuid()::text, heritage_jacket_id, '6', 'HDJ-001-6', 12, NOW(), NOW()),
    (gen_random_uuid()::text, heritage_jacket_id, '8', 'HDJ-001-8', 8, NOW(), NOW()),
    (gen_random_uuid()::text, heritage_jacket_id, '10', 'HDJ-001-10', 5, NOW(), NOW()),
    (gen_random_uuid()::text, heritage_jacket_id, '12', 'HDJ-001-12', 3, NOW(), NOW());

  -- Product Tags
  INSERT INTO "ProductTag" (id, "productId", name, "createdAt", "updatedAt")
  VALUES 
    (gen_random_uuid()::text, heritage_jacket_id, 'new', NOW(), NOW()),
    (gen_random_uuid()::text, heritage_jacket_id, 'bestseller', NOW(), NOW());

  -- Product Collection
  INSERT INTO "ProductCollection" (id, "productId", "collectionId", "order", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    heritage_jacket_id,
    new_arrivals_id,
    0,
    NOW(),
    NOW()
  );

  -- Product 2: Premium Cotton Tee
  INSERT INTO "Product" (id, name, slug, description, price, sku, "categoryId", "inStock", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    'Premium Cotton Tee',
    'premium-cotton-tee',
    'The foundation of effortless style. Crafted from ultra-soft organic cotton with a refined relaxed fit.',
    4500,
    'PCT-001',
    boys_category_id,
    true,
    NOW(),
    NOW()
  )
  RETURNING id INTO premium_tee_id;

  SELECT id INTO premium_tee_id FROM "Product" WHERE slug = 'premium-cotton-tee';

  INSERT INTO "ProductImage" (id, "productId", url, alt, "isPrimary", "order", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    premium_tee_id,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop',
    'Premium Cotton Tee',
    true,
    0,
    NOW(),
    NOW()
  );

  INSERT INTO "ProductVariant" (id, "productId", size, sku, stock, "createdAt", "updatedAt")
  VALUES 
    (gen_random_uuid()::text, premium_tee_id, '2T', 'PCT-001-2T', 20, NOW(), NOW()),
    (gen_random_uuid()::text, premium_tee_id, '3T', 'PCT-001-3T', 25, NOW(), NOW()),
    (gen_random_uuid()::text, premium_tee_id, '4T', 'PCT-001-4T', 30, NOW(), NOW()),
    (gen_random_uuid()::text, premium_tee_id, '5T', 'PCT-001-5T', 28, NOW(), NOW()),
    (gen_random_uuid()::text, premium_tee_id, '6', 'PCT-001-6', 22, NOW(), NOW()),
    (gen_random_uuid()::text, premium_tee_id, '8', 'PCT-001-8', 18, NOW(), NOW()),
    (gen_random_uuid()::text, premium_tee_id, '10', 'PCT-001-10', 15, NOW(), NOW()),
    (gen_random_uuid()::text, premium_tee_id, '12', 'PCT-001-12', 12, NOW(), NOW());

  INSERT INTO "ProductTag" (id, "productId", name, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, premium_tee_id, 'bestseller', NOW(), NOW());

  INSERT INTO "ProductCollection" (id, "productId", "collectionId", "order", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    premium_tee_id,
    street_essentials_id,
    0,
    NOW(),
    NOW()
  );

  -- Product 3: Classic Chino Pants
  INSERT INTO "Product" (id, name, slug, description, price, sku, "categoryId", "inStock", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    'Classic Chino Pants',
    'classic-chino-pants',
    'Versatile chinos that seamlessly transition from playdates to family outings. Made from premium cotton twill.',
    6800,
    'CCP-001',
    boys_category_id,
    true,
    NOW(),
    NOW()
  )
  RETURNING id INTO chino_pants_id;

  SELECT id INTO chino_pants_id FROM "Product" WHERE slug = 'classic-chino-pants';

  INSERT INTO "ProductImage" (id, "productId", url, alt, "isPrimary", "order", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    chino_pants_id,
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2070&auto=format&fit=crop',
    'Classic Chino Pants',
    true,
    0,
    NOW(),
    NOW()
  );

  INSERT INTO "ProductVariant" (id, "productId", size, sku, stock, "createdAt", "updatedAt")
  VALUES 
    (gen_random_uuid()::text, chino_pants_id, '4T', 'CCP-001-4T', 8, NOW(), NOW()),
    (gen_random_uuid()::text, chino_pants_id, '5T', 'CCP-001-5T', 10, NOW(), NOW()),
    (gen_random_uuid()::text, chino_pants_id, '6', 'CCP-001-6', 12, NOW(), NOW()),
    (gen_random_uuid()::text, chino_pants_id, '8', 'CCP-001-8', 15, NOW(), NOW()),
    (gen_random_uuid()::text, chino_pants_id, '10', 'CCP-001-10', 10, NOW(), NOW()),
    (gen_random_uuid()::text, chino_pants_id, '12', 'CCP-001-12', 7, NOW(), NOW());

  INSERT INTO "ProductTag" (id, "productId", name, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, chino_pants_id, 'bestseller', NOW(), NOW());

  -- Product 4: Girls' Floral Dress
  INSERT INTO "Product" (id, name, slug, description, price, sku, "categoryId", "inStock", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    'Floral Garden Dress',
    'floral-garden-dress',
    'A whimsical dress that captures the essence of childhood wonder. Delicate floral patterns on premium cotton fabric.',
    8900,
    'FGD-001',
    girls_category_id,
    true,
    NOW(),
    NOW()
  )
  RETURNING id INTO floral_dress_id;

  SELECT id INTO floral_dress_id FROM "Product" WHERE slug = 'floral-garden-dress';

  INSERT INTO "ProductImage" (id, "productId", url, alt, "isPrimary", "order", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    floral_dress_id,
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop',
    'Floral Garden Dress',
    true,
    0,
    NOW(),
    NOW()
  );

  INSERT INTO "ProductVariant" (id, "productId", size, sku, stock, "createdAt", "updatedAt")
  VALUES 
    (gen_random_uuid()::text, floral_dress_id, '2T', 'FGD-001-2T', 12, NOW(), NOW()),
    (gen_random_uuid()::text, floral_dress_id, '3T', 'FGD-001-3T', 15, NOW(), NOW()),
    (gen_random_uuid()::text, floral_dress_id, '4T', 'FGD-001-4T', 18, NOW(), NOW()),
    (gen_random_uuid()::text, floral_dress_id, '5T', 'FGD-001-5T', 20, NOW(), NOW()),
    (gen_random_uuid()::text, floral_dress_id, '6', 'FGD-001-6', 16, NOW(), NOW()),
    (gen_random_uuid()::text, floral_dress_id, '8', 'FGD-001-8', 14, NOW(), NOW()),
    (gen_random_uuid()::text, floral_dress_id, '10', 'FGD-001-10', 10, NOW(), NOW()),
    (gen_random_uuid()::text, floral_dress_id, '12', 'FGD-001-12', 8, NOW(), NOW());

  INSERT INTO "ProductTag" (id, "productId", name, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, floral_dress_id, 'new', NOW(), NOW());

  INSERT INTO "ProductCollection" (id, "productId", "collectionId", "order", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    floral_dress_id,
    new_arrivals_id,
    1,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Database seeded successfully!';
END $$;
