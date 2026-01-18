# 🔒 Supabase RLS (Row Level Security) Setup Guide

## Overview

This guide explains how to set up Row Level Security (RLS) policies for your Supabase database. RLS provides an additional layer of security at the database level, even when using Prisma with a service role key.

## ⚠️ Important Notes

### Current Architecture

Your application uses:
- **Custom JWT authentication** (not Supabase Auth)
- **Prisma ORM** with service role key
- **Direct PostgreSQL connection** (not Supabase PostgREST API)

### RLS Behavior with Prisma

When using Prisma with a service role key:
- **Service role key bypasses RLS** by default
- RLS policies still provide protection if:
  - Someone gains access to a non-service-role connection
  - You migrate to Supabase Auth in the future
  - You use Supabase PostgREST API for some operations

**RLS is still valuable** as defense-in-depth security!

---

## 📋 Setup Steps

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run RLS Migration

1. Open the file: `prisma/migrations/enable_rls_policies.sql`
2. Copy the entire SQL script
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Cmd/Ctrl + Enter`)

### Step 3: Verify RLS is Enabled

Run this verification query in the SQL Editor:

```sql
-- Check RLS status on all tables
SELECT 
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
```

**Expected Result:** All tables should show `rls_enabled = true`

### Step 4: Verify Policies are Created

Run this query to see all policies:

```sql
-- List all RLS policies
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Result:** You should see policies for all tables

---

## 🔐 Policy Summary

### **Admin Tables (Full Protection)**
- `AdminUser` - Only service role access
- `AdminActivityLog` - Only service role access
- `InventoryLog` - Only service role access

### **Customer Data (Protected)**
- `User` - Service role full access (customers can see own data in future)
- `Order` - Service role full access (customers can see own orders in future)
- `OrderItem` - Service role full access

### **Public Data (Read-Only Public, Write Admin)**
- `Product` - Public read, service role write
- `ProductVariant` - Public read, service role write
- `ProductImage` - Public read, service role write
- `Category` - Public read, service role write
- `Collection` - Public read, service role write
- `ProductCollection` - Public read, service role write
- `ProductTag` - Public read, service role write

---

## 🛡️ Security Model

### Current Setup (Custom JWT Auth)

```
┌─────────────────────────────────────┐
│  Application (Next.js)               │
│  - Custom JWT Authentication         │
│  - RBAC in Application Layer         │
└──────────────┬──────────────────────┘
               │
               │ Prisma + Service Role Key
               │ (Bypasses RLS)
               ▼
┌─────────────────────────────────────┐
│  Supabase PostgreSQL                │
│  - RLS Enabled                      │
│  - Policies Defined                 │
│  - Defense-in-Depth                  │
└─────────────────────────────────────┘
```

### Future Setup (Supabase Auth)

If you migrate to Supabase Auth, RLS policies can be enhanced:

```sql
-- Example: Allow users to see their own orders
CREATE POLICY "Order_own_orders"
  ON "Order"
  FOR SELECT
  USING (auth.uid() = "userId");
```

---

## 🔍 Testing RLS Policies

### Test 1: Verify Service Role Access

Using Prisma with service role key should work normally:

```typescript
// This should work (service role bypasses RLS)
const orders = await prisma.order.findMany();
```

### Test 2: Verify Public Read Access

Products should be readable without authentication:

```sql
-- This should work (public read policy)
SELECT * FROM "Product" WHERE "inStock" = true;
```

### Test 3: Verify Admin Write Protection

Without service role, writes should be blocked:

```sql
-- This should fail if not using service role
INSERT INTO "AdminUser" (email, name, "passwordHash", role)
VALUES ('test@example.com', 'Test', 'hash', 'viewer');
```

---

## 🚨 Troubleshooting

### Issue: "Permission denied for table"

**Cause:** RLS is enabled but no policy allows the operation.

**Solution:**
1. Check if you're using service role key in `DATABASE_URL`
2. Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'YourTable';`
3. Ensure `is_service_role()` function exists

### Issue: "Function does not exist"

**Cause:** Helper functions weren't created.

**Solution:** Re-run the migration SQL, specifically the "CREATE FUNCTION" sections.

### Issue: Policies not applying

**Cause:** Service role key bypasses RLS.

**Note:** This is expected behavior! Service role is designed to bypass RLS for administrative operations. RLS still protects against:
- Accidental non-service-role connections
- Future Supabase Auth integration
- Direct database access without service role

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/using-prisma-with-supabase)

---

## ✅ Checklist

- [ ] RLS enabled on all admin tables
- [ ] RLS enabled on all customer data tables
- [ ] RLS enabled on all product tables
- [ ] Policies created for all tables
- [ ] Helper functions created (`is_service_role`, `is_admin_user`)
- [ ] Verification queries pass
- [ ] Application still works (Prisma with service role)
- [ ] Documentation updated

---

## 🎯 Next Steps

1. **Run the migration** in Supabase SQL Editor
2. **Verify policies** are created
3. **Test application** to ensure it still works
4. **Monitor logs** for any RLS-related errors
5. **Consider future enhancements:**
   - Migrate to Supabase Auth for customer authentication
   - Add customer-specific RLS policies
   - Implement fine-grained admin permissions

---

*RLS Setup Guide - January 2025*
*All policies configured for custom JWT authentication with Prisma*
