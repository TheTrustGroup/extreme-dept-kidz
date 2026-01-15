# 🍪 How to Clear admin-token Cookie

## Quick Methods

### Method 1: Browser DevTools (Easiest)

1. **Open your site:**
   - Go to: `https://extremedeptkidz.com/admin/login`

2. **Open DevTools:**
   - Press **F12** (Windows/Linux)
   - Or **Cmd+Option+I** (Mac)
   - Or right-click → **Inspect**

3. **Go to Application/Storage tab:**
   - **Chrome/Edge:** Click **Application** tab
   - **Firefox:** Click **Storage** tab
   - **Safari:** Click **Storage** tab

4. **Find Cookies:**
   - In left sidebar, expand **Cookies**
   - Click on your domain: `extremedeptkidz.com`

5. **Delete admin-token:**
   - Find `admin-token` in the list
   - Right-click → **Delete**
   - Or select it and press **Delete** key

6. **Refresh page:**
   - Press **F5** or click refresh button

---

### Method 2: Clear All Site Cookies

1. Open DevTools (F12)
2. **Application** tab → **Cookies** → Your domain
3. Right-click on domain name → **Clear**
4. Refresh page

---

### Method 3: Browser Settings

**Chrome:**
1. Click three dots (⋮) → **Settings**
2. **Privacy and security** → **Clear browsing data**
3. Select **Cookies and other site data**
4. Time range: **Last hour** or **All time**
5. Click **Clear data**

**Firefox:**
1. Click menu (☰) → **Settings**
2. **Privacy & Security** → **Cookies and Site Data**
3. Click **Clear Data**
4. Select **Cookies and Site Data**
5. Click **Clear**

**Safari:**
1. **Safari** menu → **Preferences**
2. **Privacy** tab
3. Click **Manage Website Data**
4. Search for `extremedeptkidz.com`
5. Click **Remove** → **Remove Now**

---

### Method 4: Incognito/Private Window

1. Open new incognito/private window
2. Go to: `https://extremedeptkidz.com/admin/login`
3. This starts with no cookies

---

## ✅ Verify Cookie is Deleted

After clearing, verify:

1. Open DevTools (F12)
2. **Application** tab → **Cookies** → Your domain
3. **admin-token** should NOT be in the list
4. If it's still there, try Method 2 (clear all)

---

## 🎯 After Clearing Cookie

1. **Go to login page:**
   - `https://extremedeptkidz.com/admin/login`

2. **Enter credentials:**
   - Email: `Admin@extremedeptkidz.com`
   - Password: `VisionaryIntro`

3. **Click SIGN IN**

4. **New cookie will be created** with the correct JWT_SECRET

---

**Note:** After setting JWT_SECRET in Vercel and redeploying, you MUST clear the old cookie for the new token to work!
