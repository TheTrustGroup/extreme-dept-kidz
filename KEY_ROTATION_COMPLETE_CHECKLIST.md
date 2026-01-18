# ✅ Key Rotation Complete - Verification Checklist

## ✅ Step 1: Vercel Environment Variable Updated

You've set the new key in Vercel - great! ✅

**Verify it's set correctly:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `SUPABASE_SERVICE_ROLE_KEY`
3. Verify it's enabled for: ✅ Production ✅ Preview ✅ Development
4. **Important:** The value should be your NEW key (not the old one that was exposed)

---

## ✅ Step 2: Redeploy Application (IMPORTANT)

**Environment variables only apply to NEW deployments!**

1. Go to Vercel Dashboard → **Deployments**
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

**Why:** The old key might still be cached in the current deployment.

---

## ✅ Step 3: Update Local Development (If Needed)

If you're testing locally, also update `.env.local`:

```bash
# Create or update .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=your-new-key-here" > .env.local
```

**Or manually edit `.env.local`** and add:
```
SUPABASE_SERVICE_ROLE_KEY=your-new-key-here
```

---

## ✅ Step 4: Verify Old Key is Invalidated

**Test that the old key no longer works:**

```bash
# Try with old key (should fail)
export SUPABASE_SERVICE_ROLE_KEY=old-exposed-key-here
curl -s -X POST 'https://puuszplmdbindiesfxlr.supabase.co/auth/v1/admin/password/reset' \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq
```

**Expected:** Should return an error (401 or 403)

**Then test with new key:**
```bash
# Use new key (should work)
export SUPABASE_SERVICE_ROLE_KEY=your-new-key-here
curl -s -X POST 'https://puuszplmdbindiesfxlr.supabase.co/auth/v1/admin/password/reset' \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq
```

**Expected:** Should return success

---

## ✅ Step 5: Test the Script

After setting up `.env.local` locally:

```bash
npm run reset-password-supabase -- user@example.com
```

**Expected output:**
```
🔄 Resetting password for: user@example.com
✅ Password reset email sent successfully!
📧 Check the email inbox for: user@example.com
✅ Done!
```

---

## ✅ Step 6: Audit Access (Optional but Recommended)

**Check Supabase logs for suspicious activity:**

1. Go to Supabase Dashboard → **Logs** → **Auth Logs**
2. Review recent API calls
3. Look for any unauthorized access attempts
4. Check for unusual patterns

**Check database changes:**
1. Go to Supabase Dashboard → **Table Editor**
2. Review recent changes to sensitive tables
3. Check for unexpected modifications

---

## 📋 Final Checklist

- [x] New key generated in Supabase Dashboard
- [x] Old key invalidated (automatically when new one is generated)
- [x] Vercel environment variable updated with NEW key
- [ ] Application redeployed (if using Vercel)
- [ ] Local `.env.local` updated (if testing locally)
- [ ] Old key verified as invalid
- [ ] New key verified as working
- [ ] Script tested successfully
- [ ] Supabase logs reviewed (optional)

---

## 🔒 Security Best Practices Going Forward

1. **Never share keys** in conversations, code, or documentation
2. **Use environment variables** - never hardcode
3. **Rotate keys periodically** - every 6-12 months
4. **Use different keys** for development and production
5. **Monitor access** - check logs regularly
6. **Use least privilege** - only grant necessary permissions

---

## 🎯 Status

✅ **Key rotated in Vercel** - Good!
⏳ **Next:** Redeploy application to apply new key
⏳ **Next:** Update local `.env.local` if testing locally
⏳ **Next:** Verify old key is invalid

---

**Last Updated:** After Vercel key update
**Priority:** Complete remaining steps to fully secure the system
