# 🔐 Supabase Auth Password Reset Guide

## ⚠️ Important Note

**This is for Supabase Auth users only!**

Your current admin system uses **custom authentication** with the `AdminUser` table. This guide is for resetting passwords in **Supabase Auth** (if you're using it for other users or plan to migrate).

---

## 🔄 Two Different Systems

### 1. Custom Admin Authentication (Current System)
- Uses `AdminUser` table in your database
- Password reset: Use `scripts/reset-admin-password.ts`
- **This is what you're currently using**

### 2. Supabase Auth (Alternative System)
- Uses Supabase's built-in authentication
- Password reset: Use `scripts/reset-password-supabase.ts` or curl command
- **Only use this if you're using Supabase Auth**

---

## ✅ Secure Password Reset Methods

### Method 1: Using the Script (Recommended)

**Step 1: Set Environment Variable**

**For local development:**
```bash
# Add to .env.local
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**For production (Vercel):**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add: `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key-here`
3. Enable for: Production, Preview, Development

**Step 2: Run the Script**

```bash
# Using environment variable from .env.local
npm run reset-password-supabase -- user@example.com

# Or inline (not recommended for production)
SUPABASE_SERVICE_ROLE_KEY=your-key npm run reset-password-supabase -- user@example.com
```

**Step 3: Check Email**

The user will receive a password reset email at the provided address.

---

### Method 2: Using curl (For Quick Testing)

**Set the key in your environment:**
```bash
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Run the command:**
```bash
curl -s -X POST 'https://puuszplmdbindiesfxlr.supabase.co/auth/v1/admin/password/reset' \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}' | jq
```

**Expected Response:**
```json
{
  "message": "Password reset email sent"
}
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Store `SUPABASE_SERVICE_ROLE_KEY` in environment variables only
- Use `.env.local` for local development (already in `.gitignore`)
- Use Vercel environment variables for production
- Rotate keys if accidentally exposed

### ❌ DON'T:
- Hardcode the key in source code
- Commit keys to git
- Share keys in documentation
- Use keys in client-side code
- Store keys in public repositories

---

## 📋 Getting Your Service Role Key

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** → **API**
3. Find **Service Role Key** (under "Project API keys")
4. Click **Copy** or **Reveal**
5. **⚠️ Keep this secret!** Never commit it to git

---

## 🎯 For Your Current Admin System

**If you're using the custom `AdminUser` table** (which you are), use:

```bash
# Reset password in your custom AdminUser table
npx tsx scripts/reset-admin-password.ts admin@extremedeptkidz.com NewPassword123!
```

**This updates the password hash in your `AdminUser` table directly.**

---

## 🔄 If You Want to Switch to Supabase Auth

If you want to migrate from custom auth to Supabase Auth:

1. **Create users in Supabase Auth:**
   - Use Supabase Dashboard → Authentication → Users
   - Or use the Supabase Auth API

2. **Link to AdminUser table:**
   - Add `auth_user_id` column to `AdminUser` table
   - Update login code to use Supabase Auth

3. **Then use this password reset method**

**Note:** This requires significant code changes. Your current system works fine!

---

## ✅ Verification

After running password reset:

1. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs → Auth Logs
   - Look for password reset events

2. **Check email:**
   - User should receive password reset email
   - Email contains reset link

3. **Test login:**
   - User clicks reset link in email
   - Sets new password
   - Can login with new password

---

## 📁 Files

- `scripts/reset-password-supabase.ts` - Secure script using environment variables
- `scripts/reset-admin-password.ts` - For custom AdminUser table (your current system)

---

**Status:** ✅ Secure implementation ready
**Action Required:** Set `SUPABASE_SERVICE_ROLE_KEY` in environment variables
