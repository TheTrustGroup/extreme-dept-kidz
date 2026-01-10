# Get Correct Connection String from Supabase

The connection is reaching the server but authentication is failing. Let's get the exact connection string from Supabase.

## Steps to Get Connection String

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project: `puuszplmdbindiesfxlr`

2. **Navigate to Database Settings:**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **Database** in the settings menu

3. **Get Connection String:**
   - Scroll to **Connection string** section
   - Select **URI** format (not "Session mode" or "Transaction mode")
   - Click **Copy** button
   - The string will look like:
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
     OR
     ```
     postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

4. **Update .env.local:**
   - Replace the DATABASE_URL in `.env.local` with the exact string from Supabase
   - Make sure to keep the quotes: `DATABASE_URL="..."`
   - If the string doesn't have `?sslmode=require`, add it at the end

5. **Test Connection:**
   ```bash
   npx prisma migrate dev --name add_admin_user_model
   ```

## Alternative: Reset Database Password

If the connection string still doesn't work:

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Database Password** section
3. Click **Reset Database Password**
4. Copy the new password
5. Update `.env.local`:
   - Replace the password in DATABASE_URL
   - URL-encode special characters:
     - `!` = `%21`
     - `@` = `%40`
     - `#` = `%23`
     - etc.

## Quick Update Command

Once you have the connection string, I can help you update it. Or you can manually edit `.env.local`:

```bash
# Open .env.local in your editor
code .env.local
# or
nano .env.local
```

Then replace the DATABASE_URL line with the exact string from Supabase.
