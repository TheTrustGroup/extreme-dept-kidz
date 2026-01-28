# Admin & Hero Audit – Summary

Audit covers: hero video performance, admin login/session issues, and always-visible sign out.

---

## 1. Hero video (IMG_4474.mp4)

### Setup
- **File:** `/public/IMG_4474.mp4` → served as `/IMG_4474.mp4`
- **Poster:** `/Extreme 1.png` – shows immediately before video plays (fast first frame)
- **Component:** `components/home/HeroSection.tsx`

### Optimizations for speed and devices
- **Poster** – `poster` attribute so a frame is visible as soon as the section loads (good LCP, no blank hero)
- **Preload** – `preload="metadata"` so only metadata loads first; full video loads in background
- **Autoplay-safe** – `muted`, `playsInline`, `autoPlay` for iOS and modern browsers
- **Layout** – `object-fit: cover`, full viewport, `contain: layout style paint` to avoid reflow
- **Extra** – `disablePictureInPicture`, `disableRemotePlayback` for consistent behavior
- **Caching** – `next.config.js`: mp4/webm/mov get `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`

### Cross‑device behavior
- **Desktop:** Poster → video; parallax on scroll
- **Mobile:** Same; `playsInline` avoids fullscreen take-over on iOS
- **Slow networks:** Poster stays visible; video loads when ready

---

## 2. Admin – session and “Invalid or expired token”

### Cause
- Cookie `admin-token` was set for **7 days**, but the JWT inside it expired after **15 minutes**.
- After ~15 minutes, every admin API call saw an expired token and returned “Invalid or expired token”.

### Fixes applied
- **JWT lifetime** (`lib/auth/jwt.ts`): default `JWT_EXPIRES_IN` changed from `'15m'` to `'7d'` so it matches the cookie. New logins get a 7‑day token.
- **Category create** (`app/admin/categories/new/page.tsx`): on 401 or token/expired-style errors, show “Session expired – Please log in again” and redirect to `/admin/login`.
- **Category edit** (`app/admin/categories/[id]/edit/page.tsx`): same 401 handling and redirect.

### What to do after deploy
1. Deploy the new build.
2. Log out (or clear site cookies).
3. Log in again once to receive a fresh 7‑day token.

---

## 3. Sign out visibility

### Before
- “Sign out” lived only inside the **user dropdown** (click avatar/name → open menu → “Sign out”). Easy to miss.

### After
- **Always-visible “Sign out”** in the admin header (`components/admin/AdminHeader.tsx`):
  - Placed in the top-right, **before** the user avatar/name.
  - Shows **Sign out** text on `sm+` and a **LogOut** icon on small screens.
  - Same `logout()` as the dropdown; no extra steps.

You now have:
- One clear “Sign out” in the header (always visible when logged in).
- “Sign out” still in the user dropdown and in the sidebar.

---

## 4. Checklist for you to run

- [ ] **Hero**
  - [ ] Homepage loads; poster shows right away, then video plays (or plays when ready).
  - [ ] Test on phone (e.g. iOS Safari) – no fullscreen hijack, video plays inline.
  - [ ] Slow 3G (DevTools): poster visible immediately, hero doesn’t stay blank.
- [ ] **Admin login**
  - [ ] Go to `/admin/login`, sign in with your admin user.
  - [ ] “Sign out” is visible in the top-right of the header (icon and/or “Sign out” text).
  - [ ] Click “Sign out” → redirect to login and session cleared.
- [ ] **Admin session**
  - [ ] After a fresh login, create a category (e.g. “Outfit Sets”, slug “outfit-sets”).
  - [ ] No “Invalid or expired token” during that session.
  - [ ] If you do get a session error, you see “Session expired” and a redirect to login.
- [ ] **Categories → website**
  - [ ] New category appears under Admin → Categories.
  - [ ] Products in that category appear on `/collections/[category-slug]` (e.g. `/collections/outfit-sets` if slug is `outfit-sets`).

---

## 5. Env / config (optional)

- **JWT lifetime:** set `JWT_EXPIRES_IN=7d` (or e.g. `24h`) in Vercel if you want to override the default.
- **Hero file:** hero video is `/IMG_4474.mp4` in `public/`. To swap it, replace that file (or add a new one and update `HERO_VIDEO_SRC` in `HeroSection.tsx`).
