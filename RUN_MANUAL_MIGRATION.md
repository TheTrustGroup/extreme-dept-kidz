# Manual Migration Instructions

Since Prisma migration is having connection issues, you can run the migration directly in Supabase SQL Editor.

## Step 1: Run SQL in Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL from `prisma/migrations/manual_admin_user.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 2: Generate Prisma Client

After running the SQL, generate Prisma client:

```bash
npx prisma generate
```

## Step 3: Create Admin User

```bash
npm run create-admin admin@extremedeptkidz.com "YourSecurePassword123!" "Admin Name"
```

## Step 4: Test Login

1. Go to `/admin/login`
2. Use the credentials you created
3. Should work with JWT authentication!

---

**The SQL file is ready at:** `prisma/migrations/manual_admin_user.sql`

Just copy it and run in Supabase SQL Editor!
