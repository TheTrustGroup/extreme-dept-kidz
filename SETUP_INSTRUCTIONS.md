# Database Setup Instructions

## Current Status
⚠️ **Connection Issue**: The database connection is currently failing due to network/firewall restrictions. The connection string is properly configured in `.env`.

## Prerequisites
- ✅ `.env` file configured with Supabase connection string
- ✅ Prisma schema defined (`prisma/schema.prisma`)
- ✅ Seed script ready (`prisma/seed.ts`)

## Steps to Complete Setup

### Step 1: Resolve Connection Issue

**Option A: Check Supabase IP Allowlist**
1. Go to Supabase Dashboard → Settings → Database
2. Check if IP restrictions are enabled
3. Either add your IP address or disable restrictions temporarily

**Option B: Use Connection Pooler**
Try updating `.env` to use port 6543:
```env
DATABASE_URL="postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
```

**Option C: Deploy to Vercel First**
- The connection will likely work when deployed
- Add `DATABASE_URL` to Vercel environment variables
- Run migrations after deployment

### Step 2: Run Migrations

Once connection is established, run:

```bash
# Create database tables
npx prisma migrate dev --name init
```

This will:
- Create all tables defined in `prisma/schema.prisma`
- Generate Prisma Client
- Create migration files in `prisma/migrations/`

### Step 3: Seed Database

After migrations succeed:

```bash
# Seed with initial data
npm run db:seed
```

This will populate:
- Categories (Boys, Girls, Accessories, etc.)
- Collections (New Arrivals, Street Essentials, etc.)
- Sample products with variants and images
- Inventory data

### Step 4: Verify Setup

```bash
# View database in browser
npx prisma studio
```

This opens Prisma Studio at http://localhost:5555 where you can:
- View all tables
- Browse data
- Edit records
- Verify seed data was created

## Alternative: Manual SQL Migration

If Prisma migrations don't work, you can run the SQL manually in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from the migration files (once created)
3. Or use Supabase's table editor to create tables manually

## Troubleshooting

### "Can't reach database server"
- Check Supabase project is active
- Verify connection string is correct
- Try different network (mobile hotspot)
- Check firewall settings

### "Migration failed"
- Ensure database is empty or use `--skip-seed` flag
- Check for conflicting migrations
- Review error messages for specific table issues

### "Seed script errors"
- Ensure migrations ran successfully first
- Check that all required tables exist
- Verify data types match schema

## Next Steps After Setup

1. ✅ Database tables created
2. ✅ Initial data seeded
3. Test API endpoints:
   - `GET /api/products` - Should return products
   - `GET /api/products/[slug]` - Should return single product
   - `GET /api/inventory/[productId]` - Should return inventory
4. Replace mock data in frontend with API calls
5. Set up checkout/order API routes

## Current Configuration

**Connection String:**
```
postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres?sslmode=require
```

**Schema File:** `prisma/schema.prisma`
**Seed File:** `prisma/seed.ts`
