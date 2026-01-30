# Homepage Sections Below "Just Dropped"

This doc explains the sections between **Just dropped** and **Shop by Category** on the homepage: what they do, whether they’re hardcoded, and how to refine them.

---

## Order on the page (after world-class refinement)

1. **Just dropped** — Server-rendered, URL filter (`?filter=boys|girls|new|all`). Products from DB.
2. **Shop Girls** (GirlsCollectionSection) — Renders **only when there are girls products**. “Shop Girls” / “Curated for her”. Up to 4 products, then “View Girls Collection”.
3. **Shop by Category** (ShopByCategory) — “Shop by Category”. Grid of categories from DB.

**Removed from homepage:** Shop by Style (component kept in codebase for future use).

---

## 1. Shop Girls (GirlsCollectionSection) — refined

| | |
|---|---|
| **Purpose** | Spotlight girls’ products with a clear CTA to `/collections/girls`. |
| **Data** | **From DB** — same `products` prop, filtered by `category.slug === "girls"`, first 4. |
| **Refinement applied** | • Renders **only when** there are girls products (no empty block). • Renamed to **“Shop Girls”** / **“Curated for her”** so the purpose is obvious. • Dark mode supported. |

---

## 2. Shop by Style — removed from homepage

**Refinement applied:** Section removed from the homepage for a simpler, world-class flow (Just dropped → Shop Girls when applicable → Shop by Category). The component `ShopByStyleSection` remains in the codebase for future use (e.g. a dedicated page or when driven by DB/CMS).

---

## 3. Shop by Category (ShopByCategory)

| | |
|---|---|
| **Purpose** | Browse by real categories (Boys, Girls, etc.) in a grid. |
| **Data** | **From DB** — `getAllCategories()`, active only, first 4. Not hardcoded. |
| **Use** | Clear “shop by category” navigation; stays in sync with Admin categories. |

**Refinement** — Already data-driven; optional tweaks: limit/order categories (e.g. by sort order or “featured”) if you add that to the schema later.

---

## Summary (after refinement)

| Section           | Purpose              | On homepage        |
|------------------|----------------------|--------------------|
| Shop Girls       | Girls spotlight + CTA| Only when girls products exist |
| Shop by Style    | —                    | Removed (component kept for later) |
| Shop by Category | Category grid        | Yes (DB)           |
