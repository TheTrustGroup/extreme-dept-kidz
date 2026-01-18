# Fix Database Connection

## Current Issue

The script is getting: "Authentication failed against database server"

This means your `DATABASE_URL` in `.env.local` is either:
- Incorrect
- Expired
- Missing required parameters

---

## Step 1: Get Correct Connection String from Supabase

### Option A: Connection Pooling (Recommended for Production)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string**
5. Select **Connection pooling** tab
6. Copy the **URI** connection string
7. It should look like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Option B: Direct Connection (For Scripts)

1. Same steps as above
2. Select **Direct connection** tab instead
3. Copy the **URI** connection string
4. It should look like:
   ```
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

---

## Step 2: Update .env.local

1. Open `.env.local` in your project root
2. Find or add `DATABASE_URL`
3. Replace with the connection string from Supabase
4. Make sure there are no extra spaces or quotes

**Example:**
```env
DATABASE_URL=postgresql://postgres.xxxxx:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important:**
- No quotes around the URL
- No spaces
- Replace `[password]` with your actual database password
- If password has special characters, they may need URL encoding

---

## Step 3: Get Your Database Password

If you don't know your database password:

1. Go to Supabase Dashboard
2. **Settings** → **Database**
3. Scroll to **Database password**
4. Click **Reset database password** if needed
5. Copy the new password
6. Update `DATABASE_URL` with the new password

---

## Step 4: Test Connection

After updating `.env.local`, test the connection:

```bash
npm run cleanup-and-create-admin
```

If it works, you'll see:
```
🧹 Starting cleanup and admin creation...
📋 Step 1: Deleting all existing admin users...
✅ Deleted X admin user(s)
```

---

## Common Issues

### Issue: "Connection refused"
**Fix:** Check if you're using the correct port (6543 for pooling, 5432 for direct)

### Issue: "Password authentication failed"
**Fix:** 
- Reset database password in Supabase
- Update DATABASE_URL with new password
- Make sure password is URL-encoded if it has special characters

### Issue: "Database does not exist"
**Fix:** Make sure the database name in the URL is `postgres` (default for Supabase)

### Issue: "Connection timeout"
**Fix:** 
- Check your internet connection
- Try direct connection instead of pooling
- Check Supabase project status

---

## Quick Check

Run this to verify DATABASE_URL format:

```bash
# Check if DATABASE_URL is set (won't show the actual value for security)
node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')"
```

Or check your `.env.local` file directly.

---

## Need Help?

If you're still having issues:
1. Double-check the connection string from Supabase
2. Make sure you copied the entire string
3. Verify the password is correct
4. Try the direct connection instead of pooling
