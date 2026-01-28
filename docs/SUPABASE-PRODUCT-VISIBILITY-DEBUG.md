# Supabase Product Visibility – Step-by-Step Debug Guide

**Context:** Product id `cmkxg682z0008l1041lhi061h` has `price` and `inStock=true`, but it doesn’t show on the website. This guide focuses on database and Supabase-specific checks.

**Important:** The collection page (`/collections/boys` etc.) is **server-rendered**. Products are loaded by `getProductsByCategory(slug)` on the server (Prisma + your `DATABASE_URL`). There is no separate browser API call for the collection list. Visibility depends on **category**, **variants**, and **images** in the database.

---

## 0. One-shot inspection (run in Supabase SQL Editor)

Use your product id `cmkxg682z0008l1041lhi061h` in one go:

```sql
-- Product + category (id, productId, category slug/active, price, inStock)
SELECT p.id, p.name, p.slug, p."categoryId", p.price, p."inStock", p."createdAt",
       c.slug AS category_slug, c.name AS category_name, c."isActive" AS category_active
FROM "Product" p
LEFT JOIN "Category" c ON c.id = p."categoryId"
WHERE p.id = 'cmkxg682z0008l1041lhi061h';

-- ProductVariant (id, productId, isActive, stock, lowStockThreshold, reserved, createdAt)
SELECT id, "productId", size, color, sku, price, stock, reserved, "lowStockThreshold", "isActive", "createdAt"
FROM "ProductVariant" WHERE "productId" = 'cmkxg682z0008l1041lhi061h' ORDER BY "createdAt";

-- ProductImage (id, productId, url = path/type, no storage bucket column; createdAt)
SELECT id, "productId", url, alt, "isPrimary", "order", "createdAt"
FROM "ProductImage" WHERE "productId" = 'cmkxg682z0008l1041lhi061h' ORDER BY "order", "createdAt";
```

Interpret: if `category_slug` is not `boys` or `category_active` is false, the product won’t show on `/collections/boys`. If there are no variants or no images, the card may be empty or broken.

---

## 1. SQL to inspect this product and its variants/images (detailed)

Run these in **Supabase → SQL Editor** (or any Postgres client connected to your project).

### 1.1 Product and category

```sql
-- Product row and which category it’s in
SELECT
  p.id,
  p.name,
  p.slug,
  p."categoryId",
  p.price,
  p."inStock",
  p."createdAt",
  c.slug   AS category_slug,
  c.name  AS category_name,
  c."isActive" AS category_active
FROM "Product" p
LEFT JOIN "Category" c ON c.id = p."categoryId"
WHERE p.id = 'cmkxg682z0008l1041lhi061h';
```

**What to check:**  
- `category_slug` should be `boys` (or whatever collection slug you’re opening).  
- `category_active` must be `true`.  
- If `category_slug` is wrong or `category_active` is false, the product won’t appear in `getProductsByCategory('boys')`.

### 1.2 ProductVariant (id, productId, isActive, stock, lowStockThreshold, reserved, createdAt)

```sql
SELECT
  id,
  "productId",
  size,
  color,
  sku,
  price,
  stock,
  reserved,
  "lowStockThreshold",
  "isActive",
  "createdAt",
  "updatedAt"
FROM "ProductVariant"
WHERE "productId" = 'cmkxg682z0008l1041lhi061h'
ORDER BY "createdAt";
```

**What to check:**  
- At least one row exists (product needs at least one variant to render sizes).  
- `"isActive"` = `true` for variants you want to show.  
- `stock > 0` (or you accept out-of-stock in UI).  
- App code doesn’t filter by `isActive` in `getProductsByCategory`, but the UI may hide or disable out-of-stock sizes.

### 1.3 ProductImage (id, productId, url, alt, isPrimary, order, createdAt)

Your schema has `url` (path or full URL), not separate “type” or “storage bucket” columns. Use:

```sql
SELECT
  id,
  "productId",
  url,
  alt,
  "isPrimary",
  "order",
  "createdAt"
FROM "ProductImage"
WHERE "productId" = 'cmkxg682z0008l1041lhi061h'
ORDER BY "order", "createdAt";
```

**What to check:**  
- At least one row (otherwise the product card may have no image).  
- `url` is a valid path or URL (e.g. `/uploads/…` or `https://…`).  
- If you store files in Supabase Storage, `url` might be a storage path; the app must resolve it to a public URL.

---

## 2. RLS policies and when they affect you

**When RLS matters**

- **Supabase client in the browser** (e.g. `createClient(supabaseUrl, anonKey)`): every row is subject to RLS for the `anon` or `authenticated` role.  
- **Your Next.js app**: it uses **Prisma** with `DATABASE_URL`. That is usually the **pooler/direct** connection (postgres user), **not** the anon key. For that connection, RLS is typically **not** in the path, so RLS is unlikely to be why this product fails to show when the page is server-rendered.

If you add any client-side Supabase access to `Product` / `ProductVariant` / `ProductImage` / `Category`, then you must have SELECT policies for `anon`/`authenticated` on those tables.

### 2.1 List RLS and policies on the relevant tables

```sql
-- Is RLS enabled?
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('Product', 'ProductVariant', 'ProductImage', 'Category');

-- Policies on those tables
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
  AND tablename IN ('Product', 'ProductVariant', 'ProductImage', 'Category')
ORDER BY tablename, policyname;
```

**How to read it**

- `rowsecurity = true` → RLS is on; at least one policy must allow the role or no rows are returned.  
- `roles`: often `{anon, authenticated}` or similar.  
- `cmd`: `SELECT` for read. If there is no SELECT policy for the role you use from the client, reads return no rows (or error, depending on setup).  
- `qual`: condition for existing rows (e.g. `true` or `category_id = '...'`).

### 2.2 Test as anon (only if you use Supabase client from the browser)

```sql
SET ROLE anon;
SELECT id, name, "categoryId" FROM "Product" WHERE id = 'cmkxg682z0008l1041lhi061h';
SET ROLE postgres;  -- or your main role
```

If this returns no row but the same query as `postgres` (or your app user) returns a row, RLS is blocking anon for that table.

---

## 3. Browser / network / console checks

Because `/collections/[slug]` is server-rendered, the “request” that carries the product list is the **document request** for that URL, not a separate XHR to `/api/...`.

### 3.1 Network tab

1. Open DevTools → **Network**.  
2. Load `https://yoursite.com/collections/boys` (or your collection URL).  
3. Select the **document** request (first row, type `document` or `html`).  
4. Check:
   - **Status:** 200 → page rendered; 500 → server error (check server logs).  
   - **Response:** “View source” or “Preview”. If the product is in the payload, you’ll see its name/slug in the HTML or in inlined JSON. If it’s missing, the server never included it (e.g. wrong category or filter).

There is no separate “collections API” call unless you added one. If you later add a client fetch to something like `/api/products?collection=boys`, then:

- **401** → auth required (e.g. missing or invalid cookie/header).  
- **403** → forbidden (e.g. RLS or API logic blocking).  
- **200 + body `[]`** → backend returned no products (category, filters, or DB state).

### 3.2 Console

- Red errors (e.g. failed fetch, “cannot read property of undefined”) can prevent the list from rendering even if the server sent data.  
- In development, your server logs (terminal where `npm run dev` runs) may contain `[CollectionPage] getProductsByCategory('boys') returned: N` — if N is 0, the server is not returning this product.

### 3.3 Quick check: does the server “see” this product for boys?

From project root:

```bash
npm run ultimate-diagnostic
```

Then:

```bash
npm run verify
```

These use the same Prisma logic as the page. If they report 0 products for boys, the issue is in DB (category/variants) or connection, not in the browser.

---

## 4. Safe quick fixes (SQL) and rollback

Use **Supabase → SQL Editor**. Run one at a time and reload `/collections/boys` after each.

**Assumption:** you already have the id of the “boys” category from the first Product/Category query above. Replace `'BOYS_CATEGORY_ID'` with that id.

### 4.1 Put product in “boys” category

```sql
UPDATE "Product"
SET "categoryId" = 'BOYS_CATEGORY_ID'
WHERE id = 'cmkxg682z0008l1041lhi061h';
```

**Rollback:** set `"categoryId"` back to the previous value you noted from the SELECT.

### 4.2 Ensure at least one variant is active and in stock

```sql
UPDATE "ProductVariant"
SET "isActive" = true, stock = greatest(stock, 10)
WHERE "productId" = 'cmkxg682z0008l1041lhi061h';
```

**Rollback:** set `"isActive"` and `stock` back to the values you noted from the ProductVariant SELECT.

### 4.3 Ensure product looks in stock at product level

```sql
UPDATE "Product"
SET "inStock" = true
WHERE id = 'cmkxg682z0008l1041lhi061h';
```

**Rollback:**  
`UPDATE "Product" SET "inStock" = false WHERE id = 'cmkxg682z0008l1041lhi061h';`

(Only do this if your app or upstream job sets `inStock` from variants and you want to revert that.)

### 4.4 Get “boys” category id if you don’t have it

```sql
SELECT id, name, slug, "isActive" FROM "Category" WHERE slug = 'boys';
```

Use that `id` in the “Put product in boys category” update above.

---

## 5. Six-action checklist and expected outcomes

| # | Action | How | Expected outcome |
|---|--------|-----|-------------------|
| 1 | Inspect product + category | Run **§1.1** for `id = 'cmkxg682z0008l1041lhi061h'` | One row; you see `category_slug`, `category_active`. If `category_slug <> 'boys'` or `category_active = false`, that explains why it doesn’t show for `/collections/boys`. |
| 2 | Inspect variants | Run **§1.2** | At least one variant; note `stock`, `"isActive"`. If all variants are inactive or stock 0, UI may hide the product or sizes. |
| 3 | Inspect images | Run **§1.3** | At least one image with valid `url`. Empty result → product card may show placeholder or break. |
| 4 | Check RLS (if you use Supabase from browser) | Run **§2.1** and optionally **§2.2** | You see which tables have RLS and which roles have SELECT. If you don’t use Supabase client for products, you can skip or note for future. |
| 5 | Fix category + variant in DB | Run **§4.4** then **§4.1** and **§4.2** (with real `BOYS_CATEGORY_ID`) | Product’s `categoryId` = boys; at least one variant active with stock. Reload `/collections/boys` → product appears (assuming no other filters). |
| 6 | Confirm from app’s perspective | In project: `npm run verify` then `npm run dev` and open `/collections/boys` | `verify` shows “WILL appear on website: YES” and count ≥ 1; in the browser the product is visible in the grid. |

---

## 6. One-product diagnostic script

Run locally (uses Prisma, same logic as the app):

```bash
npm run inspect-product -- cmkxg682z0008l1041lhi061h
```

This prints §1.1–§1.3 and whether `getProductsByCategory('boys')` would return this product.

---

## 7. Debug result for product `cmkxg682z0008l1041lhi061h`

When this product was inspected with `npm run inspect-product -- cmkxg682z0008l1041lhi061h`:

| Check | Result |
|-------|--------|
| **§1.1 Product + category** | `category_slug: boys`, `category_active: true` → **Will show on /collections/boys? YES** |
| **§1.2 ProductVariant** | 1 variant: size `4T, 5T, 6T`, `stock: 4`, `isActive: true` |
| **§1.3 ProductImage** | 1 image: `url` is a `data:image/jpeg;base64,...` data URL |
| **Frontend query** | Boys category exists and active; this product is in boys category |

So for this product, **the database is correct** and it is included in `getProductsByCategory('boys')`. If it still doesn’t appear on the site, the cause is elsewhere.

### When DB is correct but the product doesn’t show

1. **Client-side filters** (`lib/utils/filter-products.ts`):
   - **Size filter:** The variant has size `"4T, 5T, 6T"` (one string). If the URL has `?sizes=4T` or `?sizes=5T`, the filter expects `size.size === "4T"`. `"4T, 5T, 6T"` won’t match, so the product is hidden. **Check:** Open `/collections/boys` with no query params (or clear `sizes`, `inStock`, `minPrice`, `maxPrice`).
   - **In stock only:** If `?inStock=true` and `product.inStock` is false, it’s hidden. Here `inStock` is true.
   - **Price range:** Default is `minPrice=0`, `maxPrice=18000`. If this product's price (in pesewas) > 18000, it's hidden. **Check:** Ensure price is within the filter range or reset the price filter.

2. **ProductCard / images:** The image is a long `data:image/jpeg;base64,...` URL. Next.js `<Image>` normally allows `data:` in development if the domain is in `images.domains` or `remotePatterns`; for `data:` you may need a custom loader or store the file and use a normal URL. **Check:** Open DevTools → Console for image-related errors; try a product with a normal image URL to compare.

3. **Caching:** Clear Next.js and browser cache:
   - Stop dev server, run `rm -rf .next`, then `npm run dev`.
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows).

4. **Verify from the app:** Run `npm run verify`. If it reports “WILL appear on website: YES” and “1 product” for boys, the server is returning this product; the problem is filters, rendering, or cache.

---

## Why admin-created categories (e.g. Premium Kidswear) didn't show on the site

Two things were going on:

1. **The /collections index used hardcoded "mock" data.**  
   The "Our Collections" grid came from `mockCollections` (New Arrivals, Street Essentials, Premium Basics), not from Admin → Categories. So Premium Kidswear (and any category you created in admin) never appeared as a card there.  
   **Fix (done):** The collections index page now loads **active categories** from the database via `getAllCategories()`. Every active admin category (Boys, Girls, Premium Kidswear, etc.) appears as a card and links to `/collections/[slug]`.

2. **New categories have 0 products until you assign them.**  
   Creating a category does not move or assign products. Your 1 product stayed in Boys. Premium Kidswear had 0 products, so `/collections/premium-kidswear` would show an empty list even if you opened it directly.  
   **Fix:** In Admin → Products, edit each product you want in Premium Kidswear and set **Category** to "Premium Kidswear," or create new products with that category.

---

**Summary:** For “product has price and inStock but doesn’t show,” the first place to look is **category**: correct `categoryId` for the “boys” category and that category `isActive = true`. Then ensure **variants** (at least one, ideally active and in stock) and **images** (at least one valid `url`). RLS applies only if you read these tables from the browser with the Supabase anon/authenticated client; your server-rendered collections use Prisma and `DATABASE_URL`, so RLS is usually not involved there.
