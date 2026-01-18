# 🔍 Verify Your Service Role Key

## ⚠️ Issue: 404 Error

The API returned a 404 error, which suggests the key format might be incorrect.

---

## 🔑 Key Format Check

**Your current key starts with:** `sb_secret_`

**Service Role Key should:**
- Start with `eyJ` (JWT token format)
- Be a long string (typically 200+ characters)
- Look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**The `sb_secret_` format** might be:
- A different type of Supabase key
- A secret key for a different service
- Not the Service Role Key

---

## ✅ How to Get the Correct Service Role Key

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `puuszplmdbindiesfxlr`

2. **Navigate to API Settings:**
   - Click **Settings** → **API**

3. **Find Service Role Key:**
   - Look for **"service_role"** key (not "anon" key)
   - It should be under **"Project API keys"** section
   - The key should start with `eyJ` (JWT format)

4. **Copy the Key:**
   - Click **Reveal** or **Copy**
   - The key should be very long (200+ characters)
   - It should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

---

## 🔄 Update .env.local

Once you have the correct Service Role Key:

```bash
# Update .env.local with the correct key
echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." > .env.local
```

**Or manually edit `.env.local`** and replace the key.

---

## 📋 Key Types in Supabase

**Service Role Key:**
- Format: JWT token (starts with `eyJ`)
- Purpose: Full admin access, bypasses RLS
- Use: Server-side only, for admin operations

**Anon Key:**
- Format: JWT token (starts with `eyJ`)
- Purpose: Public access, respects RLS
- Use: Client-side, for public operations

**Secret Keys (sb_secret_):**
- Format: Starts with `sb_secret_`
- Purpose: Different Supabase services
- Use: Not for Auth API

---

## ✅ Test After Updating

After updating with the correct Service Role Key:

```bash
npm run reset-password-supabase -- user@example.com
```

**Expected:** Should work without 404 error

---

**Status:** ⚠️ Need to verify key type and update if needed
