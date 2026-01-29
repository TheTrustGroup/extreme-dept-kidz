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

fetch(`${API_BASE}/api/admin/products`, { credentials: 'include' })
fetch(`${API_BASE}/api/admin/inventory`, { credentials: 'include' })
```

### 3. Login URL

Login must also go to the main site:

```javascript
// Login
fetch(`${API_BASE}/admin/api/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include',
});
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
- `/api/admin/products`
- `/api/admin/inventory`
- `/api/admin/inventory/analytics`

So once the warehouse calls **https://extremedeptkidz.com** with credentials, the browser will allow the response.
