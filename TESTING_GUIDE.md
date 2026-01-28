# Testing Guide - Admin & Collection Visibility

**Admin Credentials:** info@extremedeptkidz.com / Admin123!@#

---

## 🧪 Test Scenarios

### Scenario 1: Admin Login ✅
**Steps:**
1. Navigate to `/admin/login`
2. Enter email: `info@extremedeptkidz.com`
3. Enter password: `Admin123!@#`
4. Click "SIGN IN"

**Expected:**
- ✅ Successful login
- ✅ Redirect to `/admin` dashboard
- ✅ No error messages

**If fails:** Check browser console for errors, verify admin user exists in database

---

### Scenario 2: Create Category & Verify Visibility ✅
**Steps:**
1. Login as admin
2. Navigate to Admin → Categories → New Category
3. Create category:
   - Name: "Premium Collection"
   - Slug: "premium-collection" (auto-generated)
   - Description: "Our premium selection"
   - Active: Yes
4. Save category
5. Open new tab (customer view)
6. Visit `/collections/premium-collection`

**Expected:**
- ✅ Category appears in admin list immediately
- ✅ Collection page loads at `/collections/premium-collection`
- ✅ Category name "Premium Collection" displays
- ✅ Description displays
- ✅ Empty products message (no products yet)

**If fails:** 
- Check browser console
- Check server logs for revalidation errors
- Verify category was created in database

---

### Scenario 3: Create Product & Assign to Category ✅
**Steps:**
1. In admin, navigate to Products → New Product
2. Fill product form:
   - Name: "Test Product"
   - Category: Select "Premium Collection"
   - Price: 100.00
   - Add images
   - Add sizes/variants
3. Save product
4. In customer tab, refresh `/collections/premium-collection`

**Expected:**
- ✅ Product appears in admin product list
- ✅ Product appears on `/collections/premium-collection` immediately
- ✅ Product card displays correctly
- ✅ Product detail page works at `/products/{slug}`

**If fails:**
- Check product category assignment
- Verify cache revalidation ran
- Check browser console for errors

---

### Scenario 4: Update Category & Verify Changes ✅
**Steps:**
1. In admin, edit "Premium Collection"
2. Change description to "Updated description"
3. Save
4. In customer tab, refresh `/collections/premium-collection`

**Expected:**
- ✅ Updated description appears immediately
- ✅ No cache issues

---

### Scenario 5: Delete Category ✅
**Steps:**
1. In admin, delete "Premium Collection"
2. In customer tab, visit `/collections/premium-collection`

**Expected:**
- ✅ Category removed from admin
- ✅ Collection page shows 404 or "not found" message
- ✅ Products previously in category are handled gracefully

---

## 🔍 Potential Issues to Watch For

### Issue 1: Collection Page Shows Blank/White
**Symptoms:**
- Page loads but shows blank white section
- No products grid visible

**Possible Causes:**
- ProductGrid hydration issue (should be fixed)
- Products not loading from database
- Category not found

**Fix:** Check browser console, verify products exist in database

---

### Issue 2: Products Don't Appear After Creation
**Symptoms:**
- Product created in admin
- Doesn't appear on collection page even after refresh

**Possible Causes:**
- Cache not revalidated
- Product not assigned to correct category
- ISR not working

**Fix:** 
- Check cache revalidation logs
- Verify product.categoryId matches category.id
- Wait 60 seconds for ISR or manually revalidate

---

### Issue 3: Category Not Found
**Symptoms:**
- Category created in admin
- `/collections/{slug}` shows 404

**Possible Causes:**
- Category slug mismatch
- Category not active
- Cache not revalidated

**Fix:**
- Verify category.isActive = true
- Check slug matches exactly
- Verify cache revalidation ran

---

### Issue 4: Layout Issues on Mobile
**Symptoms:**
- Blank sections
- Overlapping elements
- Missing product grids

**Possible Causes:**
- CSS issues
- Hydration mismatches
- Responsive breakpoints

**Fix:** Check mobile viewport, verify CSS classes

---

## 🛠️ Debugging Commands

```bash
# Check admin user exists
npm run fix-admin

# Verify database connection
npm run test-db

# Test admin login (if server running)
npx tsx scripts/test-admin-and-collections.ts

# Inspect database
npm run db:studio
```

---

## 📊 Verification Checklist

### Admin Side
- [ ] Can login with info@extremedeptkidz.com / Admin123!@#
- [ ] Can create categories
- [ ] Categories appear in admin list
- [ ] Can create products
- [ ] Can assign products to categories
- [ ] Products appear in admin list

### Customer Side
- [ ] Collection pages load (`/collections/{slug}`)
- [ ] Category names display correctly
- [ ] Category descriptions display
- [ ] Products appear on collection pages
- [ ] Product cards render correctly
- [ ] Product detail pages work
- [ ] Filtering works
- [ ] Sorting works
- [ ] Mobile layout is correct
- [ ] No blank sections
- [ ] No overlapping elements

---

## 🚨 If Issues Found

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network tab for failed requests

2. **Check Server Logs**
   - Look for revalidation errors
   - Check database query errors

3. **Verify Database**
   - Run `npm run db:studio`
   - Check categories table
   - Check products table
   - Verify relationships

4. **Test Cache Revalidation**
   - Check if tags are being set
   - Verify revalidateTag is called
   - Check ISR revalidate times

---

**Status:** Ready for manual testing
