# Supabase Dashboard Checklist

Follow these steps to fix the database connection:

## Step 1: Check Project Status

1. Go to https://supabase.com/dashboard
2. Log in to your account
3. Find your project: `puuszplmdbindiesfxlr`
4. **Check the status indicator:**
   - ✅ **Green/Active** = Project is running
   - ⚠️ **Orange/Paused** = Project is paused (click "Restore")
   - ❌ **Red/Error** = There's an issue

**If paused:**
- Click the "Restore" or "Resume" button
- Wait 1-2 minutes for the database to start
- Status should change to "Active"

## Step 2: Verify Database Settings

1. In your Supabase project, go to **Settings** (gear icon in sidebar)
2. Click **Database** in the settings menu
3. Scroll to **Connection string** section
4. Select **URI** format
5. **Copy the connection string** - it should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres
   ```

## Step 3: Check Network Restrictions

1. Still in **Settings** → **Database**
2. Scroll to **Network Restrictions** or **IP Allowlist**
3. **Check if enabled:**
   - If **enabled**: Either add your IP address OR disable it temporarily
   - If **disabled**: That's fine, proceed

## Step 4: Verify Password

1. In **Settings** → **Database**
2. Look for **Database Password** section
3. **Check if password matches:**
   - Your `.env.local` has: `Zillion0031!`
   - If different, either:
     - Update `.env.local` with correct password (URL-encode special chars: `!` = `%21`)
     - OR reset password in Supabase and update `.env.local`

## Step 5: Test Connection

After checking/restoring, come back and we'll test the connection!

---

## Quick Actions

### If Project is Paused:
1. Click "Restore" button
2. Wait 1-2 minutes
3. Status should show "Active"

### If Connection String is Different:
1. Copy the exact connection string from Supabase
2. Update `.env.local` DATABASE_URL
3. Make sure to include `?sslmode=require` at the end

### If Password is Wrong:
1. Reset password in Supabase Dashboard
2. Update `.env.local` with new password (URL-encode: `!` = `%21`)

---

**Once you've checked these, let me know and we'll test the connection!**
