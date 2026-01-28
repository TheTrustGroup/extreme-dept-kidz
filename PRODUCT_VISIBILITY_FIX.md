# Product Visibility Fix Guide

## Why Products Disappear

Products can disappear from the website for several reasons:

### 1. **Category Issues** (Most Common)
- Category was deactivated (`isActive: false`)
- Category slug was changed
- Product's `categoryId` was changed or removed
- Product was moved to a different category

### 2. **Product Association Issues**
- Product's `categoryId` doesn't match any active category
- Product has no category assigned (`categoryId` is null)

### 3. **Missing Required Data**
- Product has no images (may not display correctly)
- Product has no variants (may not display correctly)

## How to Diagnose

### Option 1: Use the Diagnostic Script

```bash
# Replace with your product ID or slug
npx tsx scripts/check-product-visibility.ts <product-id-or-slug>
```

This will check:
- ✅ If product exists
- ✅ Category assignment and status
- ✅ Images and variants
- ✅ Where product should appear

### Option 2: Check in Admin Panel

1. **Go to Admin → Products**
2. **Find your product**
3. **Check:**
   - Category assignment
   - Category is active
   - Product has images
   - Product has variants

### Option 3: SQL Query (Supabase)

```sql
-- Check your product and its category
SELECT 
  p.id,
  p.name,
  p.slug,
  p."categoryId",
  p."inStock",
  c.slug AS category_slug,
  c.name AS category_name,
  c."isActive" AS category_active
FROM "Product" p
LEFT JOIN "Category" c ON c.id = p."categoryId"
WHERE p.name ILIKE '%YOUR_PRODUCT_NAME%'
   OR p.slug = 'your-product-slug';

-- Check if category exists and is active
SELECT id, name, slug, "isActive"
FROM "Category"
WHERE slug IN ('boys', 'girls', 'new-arrivals');
```

## Quick Fixes

### Fix 1: Ensure Categories Exist and Are Active

```bash
# Run the fix-product-visibility API endpoint (requires admin auth)
# This ensures "boys" and "girls" categories exist and are active
# POST /api/admin/fix-product-visibility
```

### Fix 2: Reassign Product to Correct Category

1. Go to Admin → Products
2. Edit your product
3. Select the correct category (e.g., "Boys" or "Girls")
4. Ensure category is active
5. Save

### Fix 3: Check Category Status

1. Go to Admin → Categories
2. Find your product's category
3. Ensure `isActive` is checked
4. Ensure slug matches the collection URL:
   - `/collections/boys` → slug must be `boys`
   - `/collections/girls` → slug must be `girls`
   - `/collections/new-arrivals` → slug must be `new-arrivals`

## Common Scenarios

### Scenario 1: Product Used to Show, Now Doesn't

**Possible causes:**
- Category was deactivated
- Product was moved to different category
- Category slug was changed

**Fix:**
1. Check product's current category in Admin
2. Verify category is active
3. Verify category slug matches collection URL
4. Reassign if needed

### Scenario 2: Product Never Showed

**Possible causes:**
- Product has no category assigned
- Category doesn't exist
- Category is inactive

**Fix:**
1. Assign product to correct category
2. Ensure category exists and is active
3. Verify category slug matches collection URL

### Scenario 3: Product Shows in Admin But Not on Website

**Possible causes:**
- Category is inactive
- Category slug mismatch
- Cache issue

**Fix:**
1. Check category status
2. Verify category slug
3. Clear cache / revalidate:
   ```bash
   # Revalidate collection page
   curl -X POST https://extremedeptkidz.com/api/revalidate?path=/collections/boys
   ```

## Verification Checklist

- [ ] Product exists in database
- [ ] Product has a category assigned
- [ ] Category exists and is active (`isActive: true`)
- [ ] Category slug matches collection URL
- [ ] Product has at least one image
- [ ] Product has at least one variant
- [ ] Product appears in Admin → Products
- [ ] Category appears in Admin → Categories

## Where Products Should Appear

1. **Collection Pages:**
   - `/collections/boys` → Products in "Boys" category
   - `/collections/girls` → Products in "Girls" category
   - `/collections/new-arrivals` → Products in "New Arrivals" category (or with "new" tag)

2. **Homepage:**
   - Recent products (sorted by `createdAt DESC`)
   - Featured collections

3. **Search:**
   - All products matching search query

## Still Not Showing?

1. Run diagnostic script: `npx tsx scripts/check-product-visibility.ts <product-id>`
2. Check browser console for errors
3. Check server logs for database errors
4. Verify database connection is working
5. Check if product was accidentally deleted
