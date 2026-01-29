# Warehouse App – Call Main Site API

**Problem:** "Error Loading Products" / "Cannot reach the server" on warehouse.extremedeptkidz.com.

**Cause:** The warehouse app must call the **main site API** at **extremedeptkidz.com**, not its own host. If the warehouse uses relative URLs like `/api/admin/products`, the request goes to **warehouse.extremedeptkidz.com** (wrong host – no API there).

---

## Fix in the warehouse app

### 1. Set API base URL

In the **warehouse** project, add an env var (e.g. in `.env.local` and Vercel):

```bash
NEXT_PUBLIC_API_URL=https://extremedeptkidz.com
```

(No trailing slash.)

### 2. Use it for all admin API calls

**Wrong (relative – hits warehouse host):**
```javascript
fetch('/api/admin/products', { credentials: 'include' })
fetch('/api/admin/inventory', { credentials: 'include' })
```

**Correct (absolute – hits main site):**
```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://extremedeptkidz.com';

fetch(`${API_BASE}/api/products`, { credentials: 'include' })      // public products (Inventory)
fetch(`${API_BASE}/api/admin/products`, { credentials: 'include' })  // admin products
fetch(`${API_BASE}/api/admin/inventory`, { credentials: 'include' })
fetch(`${API_BASE}/api/orders`, { credentials: 'include' })         // orders list (rewrites to admin orders)
```

### 3. Login and “current user”

Login and “me” must go to the main site:

```javascript
// Login
fetch(`${API_BASE}/admin/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include',
});

// Current user (after login)
fetch(`${API_BASE}/admin/api/me`, { credentials: 'include' });
```

### 4. Checklist

- [ ] `NEXT_PUBLIC_API_URL=https://extremedeptkidz.com` in warehouse `.env.local` and Vercel
- [ ] All admin API calls use `${API_BASE}/api/admin/...` or `${API_BASE}/admin/api/login`
- [ ] All fetch calls use `credentials: 'include'` so the auth cookie is sent
- [ ] Redeploy the warehouse app after changing env

---

## Main site (extremedeptkidz.com)

CORS is already configured on the main site for origin `https://warehouse.extremedeptkidz.com` on:

- `/api/admin/auth/login` and `/admin/api/login`
- `/admin/api/me` (rewrites to `/api/admin/auth/me`)
- `/api/products` (public products)
- `/admin/api/products` and `/admin/api/products/:id` (rewrite to `/api/admin/products`, used by warehouse Inventory)
- `/api/admin/products`
- `/api/admin/inventory`
- `/api/admin/inventory/analytics`
- `/api/orders` (rewrites to `/api/admin/orders`)

So once the warehouse calls **https://extremedeptkidz.com** with credentials, the browser will allow the response.

---

## Troubleshooting: "Something went wrong" + React error #310

**Symptom:** Warehouse app shows "Something went wrong" and the console reports **Minified React error #310** (and "Error caught by boundary").

**Meaning:** React #310 = **"Rendered more hooks than during the previous render."** That’s a **Rules of Hooks** violation: the same component is calling a different number of hooks on different renders.

**Fix (in the warehouse app codebase):**

1. **No conditional hooks** – Don’t call hooks inside `if`, `else`, or after an early `return`. Call all hooks at the top level of the component, in the same order every time.
2. **No hooks in loops** – Don’t call hooks inside `for`/`map`/`forEach`; only in the component body.
3. **Data-dependent rendering** – If you do something like “if we have products, render ComponentA (3 hooks), else render ComponentB (5 hooks)”, the *parent* is fine, but each of ComponentA/ComponentB must always call the same hooks. The bug is usually in a *child* that calls hooks conditionally on the new API data (e.g. one branch uses `useState`/`useEffect`, another doesn’t).
4. **Debug:** Run the warehouse app locally with **development** React (no minification) so the full error and component stack point to the exact component and hook. Fix that component so hooks are unconditional and in a fixed order.

This error comes from the **warehouse** frontend (React), not from the main site API. The main site already returns arrays for warehouse requests; the warehouse app must follow the Rules of Hooks.
