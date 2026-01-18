-- ============================================
-- RLS VERIFICATION SCRIPT
-- ============================================
-- 
-- Run this after enabling RLS to verify everything is set up correctly.
-- This script checks:
-- 1. RLS is enabled on all tables
-- 2. Policies are created
-- 3. Helper functions exist
-- ============================================

-- ============================================
-- 1. CHECK RLS STATUS
-- ============================================

SELECT 
  'RLS Status Check' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
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

-- ============================================
-- 2. CHECK POLICIES EXIST
-- ============================================

SELECT 
  'Policy Check' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ HAS POLICIES'
    ELSE '❌ NO POLICIES'
  END as policy_status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 3. LIST ALL POLICIES
-- ============================================

SELECT 
  'Policy Details' as check_type,
  tablename,
  policyname,
  cmd as operation,
  permissive,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
    WHEN cmd = 'ALL' THEN 'All Operations'
    ELSE cmd::text
  END as operation_type
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 4. CHECK HELPER FUNCTIONS
-- ============================================

SELECT 
  'Function Check' as check_type,
  routine_name as function_name,
  CASE 
    WHEN routine_name IN ('is_service_role', 'is_admin_user') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as function_status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_service_role', 'is_admin_user')
ORDER BY routine_name;

-- ============================================
-- 5. SUMMARY REPORT
-- ============================================

SELECT 
  'SUMMARY' as report_type,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tables_with_rls,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('is_service_role', 'is_admin_user')) as helper_functions,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) >= 13
     AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 20
     AND (SELECT COUNT(*) FROM information_schema.routines 
          WHERE routine_schema = 'public' 
          AND routine_name IN ('is_service_role', 'is_admin_user')) = 2
    THEN '✅ ALL CHECKS PASSED'
    ELSE '⚠️ SOME CHECKS FAILED'
  END as overall_status;
