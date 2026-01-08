# Running Database Migrations

## ✅ Project Linked to Vercel
Your project is now linked to `extreme-dept-kidz` on Vercel.

## Option 1: Run Migrations via API Route (Easiest)

### Step 1: Set Migration Secret (Optional but Recommended)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `MIGRATION_SECRET` = `your-secret-key-here`
3. Redeploy if needed

### Step 2: Deploy Current Code
```bash
git add .
git commit -m "Add migration API route"
git push origin main
```

### Step 3: Call Migration API
After deployment completes, run:

```bash
curl -X POST https://extreme-dept-kidz.vercel.app/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret-key"}'
```

Or use the default secret (less secure):
```bash
curl -X POST https://extreme-dept-kidz.vercel.app/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"secret":"change-this-secret"}'
```

### Step 4: Delete Migration Route (IMPORTANT!)
After migrations succeed, delete the file:
```bash
rm app/api/migrate/route.ts
git add .
git commit -m "Remove migration API route"
git push origin main
```

## Option 2: Run Migrations via Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `DATABASE_URL` is set correctly
3. Go to Deployments → Latest Deployment → Functions
4. Use Vercel's function logs to verify connection

Then run migrations manually via Supabase SQL Editor or wait for next deployment.

## Option 3: Run After Next Deployment

The migrations will automatically run if you add this to your build script, but it's better to run them manually first time.

## Verify Migrations Succeeded

1. Go to Supabase Dashboard → Table Editor
2. You should see these tables:
   - Category
   - Collection
   - Product
   - ProductImage
   - ProductVariant
   - ProductTag
   - ProductCollection
   - InventoryLog
   - Order
   - OrderItem
   - User

## Seed Database

After migrations succeed, seed the database:

```bash
# Option 1: Via API (create similar route)
curl -X POST https://extreme-dept-kidz.vercel.app/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret-key"}'

# Option 2: Via Supabase SQL Editor
# Copy and run the seed script SQL manually
```

## Current Status

- ✅ Vercel project linked
- ✅ Environment variables pulled to `.env.local`
- ✅ Migration API route created
- ⏭️ Deploy and run migrations
- ⏭️ Seed database
- ⏭️ Test API endpoints
