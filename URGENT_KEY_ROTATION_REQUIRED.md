# 🚨 URGENT: Service Role Key Exposed - Rotate Immediately

## ⚠️ CRITICAL SECURITY ALERT

**Your Supabase service role key has been exposed in this conversation.**

**Action Required:** Rotate the key immediately!

---

## 🔄 Step 1: Rotate the Key in Supabase (DO THIS NOW)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `puuszplmdbindiesfxlr`

2. **Navigate to Settings:**
   - Click **Settings** → **API**

3. **Generate New Service Role Key:**
   - Find **Service Role Key** section
   - Click **Reset** or **Generate New Key**
   - **Copy the new key immediately** (you won't see it again)

4. **Update Environment Variables:**
   - **Vercel:** Update `SUPABASE_SERVICE_ROLE_KEY` with new key
   - **Local:** Update `.env.local` with new key

---

## ✅ Step 2: Verify Key is NOT in Codebase

I've checked your codebase:
- ✅ **No key found in source files**
- ✅ **No key found in git history**
- ✅ **Codebase is secure**

**However:** The key was exposed in this conversation, so you must rotate it.

---

## 🔒 Step 3: Secure Usage Going Forward

### ✅ CORRECT Way to Use:

**Option 1: Environment Variable (Recommended)**
```bash
# Set in your shell (temporary)
export SUPABASE_SERVICE_ROLE_KEY=your-new-key-here

# Then use it
curl -s -X POST 'https://puuszplmdbindiesfxlr.supabase.co/auth/v1/admin/password/reset' \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}' | jq
```

**Option 2: Use the Script (Best Practice)**
```bash
# Add to .env.local
SUPABASE_SERVICE_ROLE_KEY=your-new-key-here

# Run the script
npm run reset-password-supabase -- user@example.com
```

### ❌ NEVER Do This:
```bash
# ❌ WRONG - Key is hardcoded
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Never share the actual key value!
```

---

## 📋 Step 4: Update All Locations

After rotating the key, update it in:

1. **Vercel Environment Variables:**
   - Dashboard → Settings → Environment Variables
   - Update `SUPABASE_SERVICE_ROLE_KEY`
   - Redeploy after updating

2. **Local Development (.env.local):**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-new-key-here
   ```

3. **Any CI/CD Systems:**
   - GitHub Actions secrets
   - Other deployment platforms

---

## 🔍 Step 5: Audit Access

After rotating the key:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Review recent API calls
   - Look for suspicious activity

2. **Review Database Changes:**
   - Check for unauthorized modifications
   - Review recent admin actions

3. **Monitor for Unusual Activity:**
   - Watch for unexpected API calls
   - Check for unauthorized data access

---

## ⚠️ Why This Is Critical

**Service Role Keys:**
- Bypass all Row Level Security (RLS) policies
- Have full database access (read, write, delete)
- Can access all tables and data
- Can modify user accounts
- Can delete data

**If exposed:**
- Anyone with the key has full database control
- Can read sensitive data
- Can modify or delete data
- Can create/delete users
- Can bypass all security measures

---

## ✅ Security Checklist

After rotating the key:

- [ ] New key generated in Supabase
- [ ] Old key invalidated
- [ ] Vercel environment variable updated
- [ ] Local `.env.local` updated
- [ ] Application redeployed (if using Vercel)
- [ ] Supabase logs reviewed
- [ ] No suspicious activity found
- [ ] Team notified (if applicable)

---

## 📞 Quick Reference

**Supabase Dashboard:**
- URL: https://supabase.com/dashboard
- Path: Settings → API → Service Role Key

**Vercel Environment Variables:**
- URL: https://vercel.com/dashboard
- Path: Your Project → Settings → Environment Variables

**Script Usage:**
```bash
npm run reset-password-supabase -- user@example.com
```

---

## 🎯 Status

- ⚠️ **Key exposed in conversation** → Rotate immediately
- ✅ **Codebase is clean** → No keys in files
- ✅ **Git history is clean** → No keys in commits
- 🔄 **Action required** → Rotate key and update environment variables

---

**Last Updated:** After key exposure detection
**Priority:** 🔴 CRITICAL - Rotate key immediately!
