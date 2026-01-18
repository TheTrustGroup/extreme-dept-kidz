# 🚨 CRITICAL: Remove Exposed Supabase Service Role Key

## ⚠️ Security Alert

If you've accidentally included a Supabase service role key in your code, you need to:

1. **Rotate the key immediately** (if it was committed)
2. **Remove it from all files**
3. **Clean git history** (if committed)

---

## ✅ Step 1: Verify Key is NOT in Codebase

I've checked your codebase and **the key is NOT present** in any files. ✅

However, if you see code like this anywhere:

```typescript
// ❌ WRONG - Key is hardcoded
Deno.env.get('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
```

**Remove it immediately!**

---

## ✅ Step 2: Use Environment Variables Instead

**Correct implementation:**

```typescript
// ✅ CORRECT - Use environment variable name
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
}

const res = await fetch('https://puuszplmdbindiesfxlr.supabase.co/auth/v1/admin/password/reset', {
  method: 'POST',
  headers: {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: 'Admin@extremedeptkidz.com' })
});
```

---

## ✅ Step 3: Set Environment Variable

**For Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `SUPABASE_SERVICE_ROLE_KEY` = `your-actual-key-here`
3. Enable for: Production, Preview, Development
4. Redeploy

**For Local Development:**
1. Create/update `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here
   ```
2. Ensure `.env.local` is in `.gitignore`

---

## ✅ Step 4: If Key Was Committed to Git

**If you accidentally committed the key:**

1. **Rotate the key in Supabase:**
   - Go to Supabase Dashboard → Settings → API
   - Generate a new service role key
   - Update all environment variables

2. **Remove from git history:**
   ```bash
   # Option 1: Use git-filter-repo (recommended)
   git filter-repo --invert-paths --path-sensitive --path "file-with-key.ts"
   
   # Option 2: Use BFG Repo-Cleaner
   bfg --replace-text passwords.txt
   
   # Option 3: If already pushed, contact GitHub support
   ```

3. **Force push (if using filter-repo):**
   ```bash
   git push origin --force --all
   ```

---

## ✅ Step 5: Verify Cleanup

**Check that key is removed:**
```bash
# Search for the key in codebase
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" . --exclude-dir=node_modules

# Should return: No matches found
```

**Check git history:**
```bash
git log --all --full-history -p -S "your-key-here" | head -20
# Should return: No matches (if cleaned)
```

---

## 🔒 Current Status

✅ **Codebase is clean** - No service role keys found in files
✅ **Git history checked** - No keys found in commits
✅ **Documentation safe** - Only warnings, no actual keys

---

## 📋 Best Practices Going Forward

1. **Never hardcode keys** in source code
2. **Always use environment variables**
3. **Add `.env.local` to `.gitignore`**
4. **Review code before committing**
5. **Use secret scanning tools** (GitHub Advanced Security)

---

**Status:** ✅ Codebase is secure
**Action Required:** None - just ensure you don't commit the code snippet you showed me!
