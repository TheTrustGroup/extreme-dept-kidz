-- Seed Script for Extreme Dept Kidz Database
-- Run this in Supabase SQL Editor after running migrations
-- Make sure to run prisma/init-migration.sql first if tables don't exist

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

-- Create Collections
INSERT INTO "Collection" (id, name, slug, description, image, "isActive", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'New Arrivals', 'new-arrivals', 'Discover our latest premium pieces', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Street Essentials', 'street-essentials', 'Urban-inspired streetwear for modern kids', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop', true, NOW(), NOW());

-- Create Products with CTEs to get IDs
WITH boys_cat AS (SELECT id FROM "Category" WHERE slug = 'boys'),
     girls_cat AS (SELECT id FROM "Category" WHERE slug = 'girls'),
     new_arrivals AS (SELECT id FROM "Collection" WHERE slug = 'new-arrivals'),
     street_essentials AS (SELECT id FROM "Collection" WHERE slug = 'street-essentials'),
     heritage_jacket AS (
       INSERT INTO "Product" (id, name, slug, description, price, sku, "categoryId", "inStock", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, 'Heritage Denim Jacket', 'heritage-denim-jacket',
              'A timeless statement piece crafted from premium Japanese selvedge denim. Meticulously constructed with vintage-inspired hardware and a thoughtfully designed relaxed fit.',
              12900, 'HDJ-001', id, true, NOW(), NOW()
       FROM boys_cat
       RETURNING id
     ),
     heritage_img AS (
       INSERT INTO "ProductImage" (id, "productId", url, alt, "isPrimary", "order", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, id, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2070&auto=format&fit=crop',
              'Heritage Denim Jacket', true, 0, NOW(), NOW()
       FROM heritage_jacket
     ),
     heritage_variants AS (
       INSERT INTO "ProductVariant" (id, "productId", size, sku, stock, "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, hj.id, size, sku, stock, NOW(), NOW()
       FROM heritage_jacket hj
       CROSS JOIN (VALUES 
         ('4T', 'HDJ-001-4T', 10),
         ('5T', 'HDJ-001-5T', 15),
         ('6', 'HDJ-001-6', 12),
         ('8', 'HDJ-001-8', 8),
         ('10', 'HDJ-001-10', 5),
         ('12', 'HDJ-001-12', 3)
       ) AS v(size, sku, stock)
     ),
     heritage_tags AS (
       INSERT INTO "ProductTag" (id, "productId", name, "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, hj.id, tag, NOW(), NOW()
       FROM heritage_jacket hj
       CROSS JOIN (VALUES ('new'), ('bestseller')) AS t(tag)
     ),
     heritage_collection AS (
       INSERT INTO "ProductCollection" (id, "productId", "collectionId", "order", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, hj.id, na.id, 0, NOW(), NOW()
       FROM heritage_jacket hj, new_arrivals na
     ),
     premium_tee AS (
       INSERT INTO "Product" (id, name, slug, description, price, sku, "categoryId", "inStock", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, 'Premium Cotton Tee', 'premium-cotton-tee',
              'The foundation of effortless style. Crafted from ultra-soft organic cotton with a refined relaxed fit.',
              4500, 'PCT-001', id, true, NOW(), NOW()
       FROM boys_cat
       RETURNING id
     ),
     premium_tee_img AS (
       INSERT INTO "ProductImage" (id, "productId", url, alt, "isPrimary", "order", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, id, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop',
              'Premium Cotton Tee', true, 0, NOW(), NOW()
       FROM premium_tee
     ),
     premium_tee_variants AS (
       INSERT INTO "ProductVariant" (id, "productId", size, sku, stock, "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, pt.id, size, sku, stock, NOW(), NOW()
       FROM premium_tee pt
       CROSS JOIN (VALUES 
         ('2T', 'PCT-001-2T', 20),
         ('3T', 'PCT-001-3T', 25),
         ('4T', 'PCT-001-4T', 30),
         ('5T', 'PCT-001-5T', 28),
         ('6', 'PCT-001-6', 22),
         ('8', 'PCT-001-8', 18),
         ('10', 'PCT-001-10', 15),
         ('12', 'PCT-001-12', 12)
       ) AS v(size, sku, stock)
     ),
     premium_tee_tag AS (
       INSERT INTO "ProductTag" (id, "productId", name, "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, pt.id, 'bestseller', NOW(), NOW()
       FROM premium_tee pt
     ),
     premium_tee_collection AS (
       INSERT INTO "ProductCollection" (id, "productId", "collectionId", "order", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, pt.id, se.id, 0, NOW(), NOW()
       FROM premium_tee pt, street_essentials se
     ),
     chino_pants AS (
       INSERT INTO "Product" (id, name, slug, description, price, sku, "categoryId", "inStock", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, 'Classic Chino Pants', 'classic-chino-pants',
              'Versatile chinos that seamlessly transition from playdates to family outings. Made from premium cotton twill.',
              6800, 'CCP-001', id, true, NOW(), NOW()
       FROM boys_cat
       RETURNING id
     ),
     chino_img AS (
       INSERT INTO "ProductImage" (id, "productId", url, alt, "isPrimary", "order", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, id, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2070&auto=format&fit=crop',
              'Classic Chino Pants', true, 0, NOW(), NOW()
       FROM chino_pants
     ),
     chino_variants AS (
       INSERT INTO "ProductVariant" (id, "productId", size, sku, stock, "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, cp.id, size, sku, stock, NOW(), NOW()
       FROM chino_pants cp
       CROSS JOIN (VALUES 
         ('4T', 'CCP-001-4T', 8),
         ('5T', 'CCP-001-5T', 10),
         ('6', 'CCP-001-6', 12),
         ('8', 'CCP-001-8', 15),
         ('10', 'CCP-001-10', 10),
         ('12', 'CCP-001-12', 7)
       ) AS v(size, sku, stock)
     ),
     chino_tag AS (
       INSERT INTO "ProductTag" (id, "productId", name, "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, cp.id, 'bestseller', NOW(), NOW()
       FROM chino_pants cp
     ),
     floral_dress AS (
       INSERT INTO "Product" (id, name, slug, description, price, sku, "categoryId", "inStock", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, 'Floral Garden Dress', 'floral-garden-dress',
              'A whimsical dress that captures the essence of childhood wonder. Delicate floral patterns on premium cotton fabric.',
              8900, 'FGD-001', id, true, NOW(), NOW()
       FROM girls_cat
       RETURNING id
     ),
     floral_img AS (
       INSERT INTO "ProductImage" (id, "productId", url, alt, "isPrimary", "order", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, id, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop',
              'Floral Garden Dress', true, 0, NOW(), NOW()
       FROM floral_dress
     ),
     floral_variants AS (
       INSERT INTO "ProductVariant" (id, "productId", size, sku, stock, "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, fd.id, size, sku, stock, NOW(), NOW()
       FROM floral_dress fd
       CROSS JOIN (VALUES 
         ('2T', 'FGD-001-2T', 12),
         ('3T', 'FGD-001-3T', 15),
         ('4T', 'FGD-001-4T', 18),
         ('5T', 'FGD-001-5T', 20),
         ('6', 'FGD-001-6', 16),
         ('8', 'FGD-001-8', 14),
         ('10', 'FGD-001-10', 10),
         ('12', 'FGD-001-12', 8)
       ) AS v(size, sku, stock)
     ),
     floral_tag AS (
       INSERT INTO "ProductTag" (id, "productId", name, "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, fd.id, 'new', NOW(), NOW()
       FROM floral_dress fd
     ),
     floral_collection AS (
       INSERT INTO "ProductCollection" (id, "productId", "collectionId", "order", "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, fd.id, na.id, 1, NOW(), NOW()
       FROM floral_dress fd, new_arrivals na
     )
SELECT 'Database seeded successfully!' AS message;
