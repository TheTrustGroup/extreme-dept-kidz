# Hand This to Your Backend / Server Person

**Goal:** So **warehouse.extremedeptkidz.com** can log in, call the API, and use real products/orders with correct roles.

---

## 1. CORS and auth

Someone with access to **extremedeptkidz.com** must:

- **Allow CORS** for `https://warehouse.extremedeptkidz.com` **with credentials** (so the browser allows login and API calls).  
  → Use **SERVER_SIDE_FIX_GUIDE.md** for your stack (Laravel, Node, Nginx, etc.).

- **Expose (or keep) these endpoints:**
  - **POST /admin/api/login** — email + password → user/session (JSON body: `{ "email", "password" }`).
  - **GET /admin/api/me** — current user, including **role** (e.g. `"role": "manager"`). The warehouse app uses this to show/hide features.

**One-page summary:** this file. **Full CORS/endpoint details:** SERVER_SIDE_FIX_GUIDE.md.

---

## 2. Create the role users

In your main store **admin / user database**:

- **Admin:** Keep your current admin email and password as they are.
- **Other roles:** Create one user per role with the logins below. Set each user’s **role** in the DB to the matching value (manager, cashier, etc.).

| Role      | Email                         | Password  |
|-----------|-------------------------------|-----------|
| manager   | manager@extremedeptkidz.com   | EDK-!@#   |
| cashier   | cashier@extremedeptkidz.com   | EDK-!@#   |
| warehouse | warehouse@extremedeptkidz.com  | EDK-!@#   |
| driver    | driver@extremedeptkidz.com    | EDK-!@#   |
| viewer    | viewer@extremedeptkidz.com    | EDK-!@#   |

- Ensure **GET /admin/api/me** returns the user with **role** (e.g. `"role": "manager"`). The warehouse app uses that to show/hide features.

---

## 3. Products (and orders) API

So Inventory and POS use real data:

- **Products:** Implement or expose something like **GET /admin/api/products** (or GET /api/products) and **allow CORS** from the warehouse origin.  
  Response: array of products with at least: **id**, **name**, **sku**, **category**, **quantity**, **sellingPrice**, **costPrice**, **location**, **supplier**.  
  → SERVER_SIDE_FIX_GUIDE.md and BACKEND_REQUIREMENTS.md (if present) have the full expected shape.

- **Orders (optional):** If you use the Orders page, expose your orders API and allow CORS for the warehouse domain for that route too.

---

## 4. Verify

1. Log in at **warehouse.extremedeptkidz.com** with **admin** (your existing credentials).
2. Log in with **manager@extremedeptkidz.com** / **EDK-!@#** and check that the right menus/actions appear.
3. In the warehouse app: **Settings → User Management** — the “Logins for other roles” table should match the users you created in the backend.

---

## Quick reference

| Item | Value |
|------|--------|
| Warehouse app URL | `https://warehouse.extremedeptkidz.com` |
| API base | `https://extremedeptkidz.com` |
| Login | `POST /admin/api/login` |
| Current user | `GET /admin/api/me` |
| Products | `GET /admin/api/products` (or `/api/products`) |
| Required CORS origin | `https://warehouse.extremedeptkidz.com` |
| Credentials | `true` |

**Files to share:** SERVER_SIDE_FIX_GUIDE.md, this file (HAND_TO_BACKEND.md).

---

## If the API is this Next.js app (extremedeptkidz.com)

CORS and the endpoints **POST /admin/api/login**, **GET /admin/api/me**, **GET /admin/api/products**, and orders are already configured (rewrites + middleware + API routes).

To **create the role users** in this repo:

1. **Apply schema change** (adds `cashier`, `warehouse`, `driver` to AdminRole):
   ```bash
   npx prisma migrate dev --name add_warehouse_admin_roles
   ```
   If the DB is elsewhere or you prefer to run SQL by hand, run this in your DB (PostgreSQL 10+):
   ```sql
   ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'cashier';
   ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'warehouse';
   ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'driver';
   ```
   Then run `npx prisma generate`.

2. **Seed the five role users** (manager, cashier, warehouse, driver, viewer with password EDK-!@#):
   ```bash
   npx tsx scripts/seed-warehouse-role-users.ts
   ```

After that, **GET /admin/api/me** will return each user with their **role**; the warehouse app can use it for menus and permissions.
