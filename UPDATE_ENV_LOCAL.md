# 🔐 Update .env.local with Your New Service Role Key

## Quick Update Instructions

**Option 1: Edit the file manually (Recommended)**

```bash
# Open .env.local in your editor
code .env.local
# or
nano .env.local
# or
open -a TextEdit .env.local
```

Then replace the line with:
```
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key-here
```

**Make sure the key:**
- Starts with `eyJ` (JWT format)
- Is the full Service Role Key from Supabase Dashboard
- Has no quotes around it
- Is on a single line

---

**Option 2: Use echo command**

```bash
# Replace YOUR_NEW_KEY_HERE with your actual key
echo "SUPABASE_SERVICE_ROLE_KEY=YOUR_NEW_KEY_HERE" > .env.local
```

**Example:**
```bash
echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." > .env.local
```

---

**Option 3: Append to existing file**

If you want to keep other variables in .env.local:

```bash
# Remove the old SUPABASE_SERVICE_ROLE_KEY line first
grep -v "SUPABASE_SERVICE_ROLE_KEY" .env.local > .env.local.tmp && mv .env.local.tmp .env.local

# Add the new key
echo "SUPABASE_SERVICE_ROLE_KEY=your-new-key-here" >> .env.local
```

---

## ✅ Verify the Update

After updating, verify the file:

```bash
cat .env.local
```

**Should show:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Test the Script

After updating, test it:

```bash
npm run reset-password-supabase -- test@example.com
```

**Expected output:**
```
🔄 Resetting password for: test@example.com
✅ Password reset email sent successfully!
📧 Check the email inbox for: test@example.com
✅ Done!
```

---

## 🔒 Security Reminder

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ⚠️ Never share the key in conversations
- ⚠️ Never commit the file to git
- ⚠️ Keep it secret

---

**Ready to update?** Use one of the methods above to set your new key!
