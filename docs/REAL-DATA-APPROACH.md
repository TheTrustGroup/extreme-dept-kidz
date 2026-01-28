# Real-Data-Only Approach

The site is set up to show **only real data** from your database. Mock collections are no longer used on public collection pages.

---

## What Changed

1. **Our Collections (`/collections`)**  
   - Shows only **active categories** from the database (Admin → Categories).  
   - If there are no categories, it shows an empty state and tells you to add categories in Admin.  
   - No mock or hardcoded collections.

2. **Collection pages (`/collections/[slug]`)**  
   - Title, description, and products come from the **category** for that slug (Admin → Categories).  
   - No mock collection data.

3. **Sitemap**  
   - Collection URLs are built from real categories only. No mock collections.

4. **Collection client**  
   - Uses only server-passed products and category info. No mock products or mock collections.

---

## Clearing Existing Data and Starting Fresh

You said you want to clear mock collections and current uploads, then create new collections. Here’s the recommended approach.

### Option A: Reset via script (clears products and categories, leaves Boys + Girls)

Run:

```bash
npm run reset-for-real-data
```

This script:

- Deletes all order items, products, and categories.
- Creates only **Boys** (slug: `boys`) and **Girls** (slug: `girls`).

Then:

1. Go to **Admin → Categories**. You’ll see Boys and Girls.
2. Add new categories (e.g. Premium Kidswear, slug `premium-kidswear`) or edit/delete Boys and Girls as you like.
3. Go to **Admin → Products → New product** and assign products to the categories you want.
4. Those categories and products are what appear on **Our Collections** and `/collections/[slug]`.

### Option B: Full wipe (no categories at all, then you create everything)

If you want **zero** categories and want to create every collection yourself:

1. Run `npm run reset-for-real-data` (this creates Boys + Girls).
2. In **Admin → Categories**, delete Boys and Girls.
3. Create all categories you want (e.g. Premium Kidswear, etc.).
4. Create products and assign them to those categories.

### Option C: Clear only via Admin (no script)

1. In **Admin → Products**, delete each product you want to remove.
2. In **Admin → Categories**, delete each category you don’t want.
3. Create new categories and products as needed.

---

## Recommended Flow for “I want real data only and will create new collections”

1. **Clear and reset**  
   Run:

   ```bash
   npm run reset-for-real-data
   ```

   That removes all products and categories, then creates Boys and Girls.

2. **Adjust categories**  
   - Open **Admin → Categories**.  
   - Keep Boys/Girls, or delete them and add your own (e.g. Premium Kidswear, others).  
   - Use the slugs you want for URLs (e.g. `premium-kidswear` → `/collections/premium-kidswear`).

3. **Add products**  
   - **Admin → Products → Add product**.  
   - Set **Category** to the collection (category) this product belongs to.  
   - Save.  
   - Repeat for all products.

4. **Check the site**  
   - **Our Collections** (`/collections`) shows a card for each active category.  
   - Clicking a card goes to `/collections/[slug]` and shows only products in that category.

---

## Summary

- **Mock collections are removed** from the collections index, collection pages, and sitemap.  
- Only **real categories** from the database are shown.  
- To start clean, run `npm run reset-for-real-data`, then create your categories and products in Admin.
