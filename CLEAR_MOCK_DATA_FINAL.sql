-- ============================================
-- CLEAR MOCK DATA - FINAL
-- This script clears all mock data and creates clean categories
-- ============================================

-- Step 1: Delete all data in correct order (respecting foreign keys)
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "InventoryLog";
DELETE FROM "ProductVariant";
DELETE FROM "ProductImage";
DELETE FROM "ProductTag";
DELETE FROM "ProductCollection";
DELETE FROM "CompleteLookProduct";
DELETE FROM "CompleteLook";
DELETE FROM "Product";
DELETE FROM "Collection";
DELETE FROM "Category";

-- Step 2: Create clean categories (Boys and Girls only)
INSERT INTO "Category" (
    "id",
    "name",
    "slug",
    "description",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES 
(
    gen_random_uuid()::text,
    'Boys',
    'boys',
    'Premium streetwear for young legends',
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid()::text,
    'Girls',
    'girls',
    'Select premium styles for girls',
    true,
    NOW(),
    NOW()
)
ON CONFLICT ("slug") DO UPDATE SET
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "isActive" = true,
    "updatedAt" = NOW();

-- Step 3: Verify categories were created
SELECT 
    id,
    name,
    slug,
    description,
    "isActive"
FROM "Category"
ORDER BY "createdAt" DESC;
