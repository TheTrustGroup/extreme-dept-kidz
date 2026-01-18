# 🔐 Setup SUPABASE_SERVICE_ROLE_KEY

## Quick Setup Guide

The script needs `SUPABASE_SERVICE_ROLE_KEY` to be set. Here are three ways to do it:

---

## Option 1: Create .env.local File (Recommended)

**Step 1: Create the file**
```bash
touch .env.local
```

**Step 2: Add your key**
```bash
# Open .env.local in your editor and add:
SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here
```

**Step 3: Verify it's in .gitignore**
✅ Already checked - `.env.local` is in `.gitignore`

**Step 4: Run the script**
```bash
npm run reset-password-supabase -- user@example.com
```

---

## Option 2: Set in Current Shell Session

**For one-time use:**
```bash
export SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here
npm run reset-password-supabase -- user@example.com
```

**Note:** This only works for the current terminal session.

---

## Option 3: Inline with Command

**For one-time use:**
```bash
SUPABASE_SERVICE_ROLE_KEY=your-actual-key-here npm run reset-password-supabase -- user@example.com
```

---

## 🔒 Security Reminders

1. **Never commit `.env.local`** - It's already in `.gitignore` ✅
2. **Never share the key** - Keep it secret
3. **Rotate if exposed** - If you accidentally share it, rotate immediately
4. **Use different keys** - Use different keys for development and production

---

## ✅ Verify Setup

After setting up, test with:
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

## 📋 Getting Your Service Role Key

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **Settings** → **API**
4. Find **Service Role Key**
5. Click **Reveal** or **Copy**
6. **⚠️ Keep it secret!**

---

**Status:** Ready to use after setting the environment variable
