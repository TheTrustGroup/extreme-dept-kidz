# Real Data Audit & How Admin → Website Works

This doc explains how **categories** and **products** created in Admin show on the live site, and how to switch to real data without the “products don’t appear” issue.

---

## How It Works

### Collection pages (`/collections/[slug]`)

- The site loads products **by category first**: it looks for a **Category** whose **slug** equals the URL slug (e.g. `/collections/boys` ↔ category slug `boys`).
- If that category exists, products in that category are shown.
- If no such category (or no products), it falls back to tag-based logic (e.g. “new-arrivals” = products with tag “new”).

So:

- **`/collections/boys`** → Category with slug **`boys`** → products where `categoryId` = that category.
- **`/collections/girls`** → Category with slug **`girls`** → products where `categoryId` = that category.
- Any **other** slug (e.g. `new-arrivals`) → if a category exists with that slug, it’s used; otherwise tag-based rules apply.

### Admin → website pipeline

1. **Categories**  
   Admin → Categories → Create “Boys” (slug `boys`), “Girls” (slug `girls`), or any name/slug you need.  
   Slug is auto-made from the name if you leave it blank (e.g. “New Arrivals” → `new-arrivals`).

2. **Products**  
   Admin → Products → New product → choose **Category** (Boys, Girls, or any category you created).  
   That sets `categoryId`. The product will show on `/collections/[category.slug]`.

3. **Revalidation**  
   Creating/updating a category or product revalidates the right `/collections/[slug]` path, so the site updates without a manual refresh.

---

## Recommendation: Start With Real Data

Yes, it’s a good idea to **clear old/seed data** and **re-upload everything from Admin** so the client runs on real data only.

### Option A – Full reset (clean slate)

Use when you’re okay wiping **all** products, categories, and order line items (order history per product is lost):

```bash
npm run reset-for-real-data
```

This script:

1. Deletes all order items, products, and categories.
2. Creates only **Boys** (slug `boys`) and **Girls** (slug `girls`).

Then:

1. Go to **Admin → Products → New product**.
2. Set **Category** to Boys or Girls.
3. Save. The product appears on `/collections/boys` or `/collections/girls`.

### Option B – Keep existing data, fix visibility only

Use when you want to **keep** current products and only fix “they don’t show on boys/girls”:

```bash
npm run fix-visibility
```

Or in the app: **Admin → Settings → “Fix product visibility”**.

This:

- Ensures **Boys** and **Girls** categories exist.
- Puts any product not already in boys/girls into **Boys**.
- Adds a default variant where missing.

After that, new products should be created in Admin and assigned to Boys or Girls (or other categories you add).

---

## Guarantees So the Issue Doesn’t Persist

These are already in place so **creating categories and products in Admin consistently shows them on the site**:

1. **Collection page logic**  
   For every `/collections/[slug]`, the app first loads products by **category slug** `[slug]`.  
   So any category you create (e.g. slug `new-arrivals`) will drive `/collections/new-arrivals` as soon as products use that category.

2. **Category slug in Admin**  
   When you create a category, slug is either:  
   - what you type in “Slug”, or  
   - auto from the name (e.g. “Boys” → `boys`).  
   Use slugs that match the URL you want (e.g. `boys`, `girls`, `new-arrivals`).

3. **Revalidation on create/update**  
   - Creating a category revalidates `/collections/[slug]`.  
   - Updating a category revalidates both old and new slug when slug changes.  
   - Creating/updating a product revalidates `/collections/[category.slug]` and related paths.

4. **Product form**  
   The admin product form loads categories from `/api/admin/categories` and saves `categoryId`.  
   So choosing “Boys” or “Girls” (or any category) correctly links the product to that category and to the right collection page.

5. **Active categories only**  
   Only categories with `isActive: true` are used for collection pages.  
   New categories are created active by default.

---

## Quick Checklist for the Client

- [ ] Decide: **full reset** (`npm run reset-for-real-data`) or **fix only** (`npm run fix-visibility` / Settings).
- [ ] Ensure **Boys** and **Girls** exist (slug `boys`, `girls`). Reset or fix-visibility does this if needed.
- [ ] Create products in **Admin → Products**, and set **Category** to Boys or Girls (or another category whose slug matches the collection URL).
- [ ] Open `/collections/boys` and `/collections/girls` (and any other `/collections/[slug]`) to confirm products appear.
- [ ] For new collection URLs, create a **Category** with the right slug (e.g. `new-arrivals`) and assign products to it; they will show on `/collections/new-arrivals`.

---

## Scripts Reference

| Script | Purpose |
|--------|--------|
| `npm run reset-for-real-data` | Delete all order items, products, categories; create Boys & Girls only. Use for a full clean start. |
| `npm run fix-visibility` | Ensure Boys & Girls exist; assign products to Boys if not already in boys/girls; add default variants. |
| `npm run inspect` | List products, categories, collections in the DB. |
| Admin → Settings → “Fix product visibility” | Same as `fix-visibility` but from the browser (e.g. on production). |
