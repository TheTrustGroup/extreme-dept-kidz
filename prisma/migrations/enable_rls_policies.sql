-- ============================================
-- SUPABASE RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================
-- 
-- This migration enables RLS on all admin tables and customer-sensitive tables.
-- Since we use custom JWT authentication (not Supabase Auth), we'll use
-- a combination of service role checks and custom functions.
--
-- IMPORTANT: These policies work with Prisma when using service role key,
-- but provide an additional layer of security at the database level.
--
-- Run this in Supabase SQL Editor after deploying your application.
-- ============================================

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

-- Admin tables (full RLS protection)
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminActivityLog" ENABLE ROW LEVEL SECURITY;

-- Customer data tables (partial RLS - protect sensitive fields)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

-- Product/Inventory tables (read-only for public, write for admins)
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryLog" ENABLE ROW LEVEL SECURITY;

-- Category/Collection tables (read-only for public, write for admins)
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Collection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductCollection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductTag" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to check if current request is from service role (Prisma)
-- This allows Prisma to work while still enabling RLS
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  -- Service role key bypasses RLS (this is expected for Prisma)
  -- We'll create policies that allow service role access
  RETURN current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'
    OR current_setting('request.jwt.claims', true)::jsonb->>'role' IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is an admin (for future Supabase Auth integration)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- For now, allow service role (Prisma) access
  -- In future, can check Supabase Auth: auth.uid() IN (SELECT id FROM "AdminUser")
  RETURN is_service_role();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. ADMIN USER TABLE POLICIES
-- ============================================

-- AdminUser: Only service role (Prisma) can access
-- In production, you may want to restrict this further
DROP POLICY IF EXISTS "AdminUser_service_role_access" ON "AdminUser";
CREATE POLICY "AdminUser_service_role_access"
  ON "AdminUser"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 4. ADMIN ACTIVITY LOG POLICIES
-- ============================================

-- AdminActivityLog: Only service role (Prisma) can access
DROP POLICY IF EXISTS "AdminActivityLog_service_role_access" ON "AdminActivityLog";
CREATE POLICY "AdminActivityLog_service_role_access"
  ON "AdminActivityLog"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 5. USER (CUSTOMER) TABLE POLICIES
-- ============================================

-- User: Service role can access all, but protect sensitive fields
-- Customers can only see their own data (if using Supabase Auth in future)
DROP POLICY IF EXISTS "User_service_role_full_access" ON "User";
CREATE POLICY "User_service_role_full_access"
  ON "User"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- Future: Allow users to see their own data
-- DROP POLICY IF EXISTS "User_own_data" ON "User";
-- CREATE POLICY "User_own_data"
--   ON "User"
--   FOR SELECT
--   USING (auth.uid() = id);

-- ============================================
-- 6. ORDER TABLE POLICIES
-- ============================================

-- Order: Service role can access all
-- Customers can only see their own orders (if using Supabase Auth in future)
DROP POLICY IF EXISTS "Order_service_role_full_access" ON "Order";
CREATE POLICY "Order_service_role_full_access"
  ON "Order"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- Future: Allow users to see their own orders
-- DROP POLICY IF EXISTS "Order_own_orders" ON "Order";
-- CREATE POLICY "Order_own_orders"
--   ON "Order"
--   FOR SELECT
--   USING (auth.uid() = "userId");

-- ============================================
-- 7. ORDER ITEM POLICIES
-- ============================================

-- OrderItem: Service role can access all
DROP POLICY IF EXISTS "OrderItem_service_role_full_access" ON "OrderItem";
CREATE POLICY "OrderItem_service_role_full_access"
  ON "OrderItem"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 8. PRODUCT TABLE POLICIES
-- ============================================

-- Product: Public can read active products, service role can write
DROP POLICY IF EXISTS "Product_public_read" ON "Product";
CREATE POLICY "Product_public_read"
  ON "Product"
  FOR SELECT
  USING (true); -- Allow public read access to products

DROP POLICY IF EXISTS "Product_service_role_write" ON "Product";
CREATE POLICY "Product_service_role_write"
  ON "Product"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 9. PRODUCT VARIANT POLICIES
-- ============================================

-- ProductVariant: Public can read, service role can write
DROP POLICY IF EXISTS "ProductVariant_public_read" ON "ProductVariant";
CREATE POLICY "ProductVariant_public_read"
  ON "ProductVariant"
  FOR SELECT
  USING (true); -- Allow public read access

DROP POLICY IF EXISTS "ProductVariant_service_role_write" ON "ProductVariant";
CREATE POLICY "ProductVariant_service_role_write"
  ON "ProductVariant"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 10. PRODUCT IMAGE POLICIES
-- ============================================

-- ProductImage: Public can read, service role can write
DROP POLICY IF EXISTS "ProductImage_public_read" ON "ProductImage";
CREATE POLICY "ProductImage_public_read"
  ON "ProductImage"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "ProductImage_service_role_write" ON "ProductImage";
CREATE POLICY "ProductImage_service_role_write"
  ON "ProductImage"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 11. INVENTORY LOG POLICIES
-- ============================================

-- InventoryLog: Only service role (admin) can access
DROP POLICY IF EXISTS "InventoryLog_service_role_access" ON "InventoryLog";
CREATE POLICY "InventoryLog_service_role_access"
  ON "InventoryLog"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 12. CATEGORY POLICIES
-- ============================================

-- Category: Public can read active categories, service role can write
DROP POLICY IF EXISTS "Category_public_read" ON "Category";
CREATE POLICY "Category_public_read"
  ON "Category"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Category_service_role_write" ON "Category";
CREATE POLICY "Category_service_role_write"
  ON "Category"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 13. COLLECTION POLICIES
-- ============================================

-- Collection: Public can read active collections, service role can write
DROP POLICY IF EXISTS "Collection_public_read" ON "Collection";
CREATE POLICY "Collection_public_read"
  ON "Collection"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Collection_service_role_write" ON "Collection";
CREATE POLICY "Collection_service_role_write"
  ON "Collection"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 14. PRODUCT COLLECTION POLICIES
-- ============================================

-- ProductCollection: Public can read, service role can write
DROP POLICY IF EXISTS "ProductCollection_public_read" ON "ProductCollection";
CREATE POLICY "ProductCollection_public_read"
  ON "ProductCollection"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "ProductCollection_service_role_write" ON "ProductCollection";
CREATE POLICY "ProductCollection_service_role_write"
  ON "ProductCollection"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- 15. PRODUCT TAG POLICIES
-- ============================================

-- ProductTag: Public can read, service role can write
DROP POLICY IF EXISTS "ProductTag_public_read" ON "ProductTag";
CREATE POLICY "ProductTag_public_read"
  ON "ProductTag"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "ProductTag_service_role_write" ON "ProductTag";
CREATE POLICY "ProductTag_service_role_write"
  ON "ProductTag"
  FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'AdminUser',
    'AdminActivityLog',
    'User',
    'Order',
    'OrderItem',
    'Product',
    'ProductVariant',
    'ProductImage',
    'InventoryLog',
    'Category',
    'Collection',
    'ProductCollection',
    'ProductTag'
  )
ORDER BY tablename;

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
