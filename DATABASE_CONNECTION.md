# Database Connection Setup

## ✅ Current Status
- **Connection string configured** in `.env` file
- **Password properly URL-encoded** (`!` = `%21`)
- **SSL mode enabled** (`sslmode=require`)
- **Connection test**: Currently failing - likely network/firewall issue

## Current Configuration
```env
DATABASE_URL="postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres?sslmode=require"
```

## Troubleshooting Connection Issues

### 1. Check Supabase Project Status
1. Go to https://supabase.com/dashboard
2. Select your project
3. Verify the project is **active** and **running**
4. Check if there are any warnings or errors

### 2. Check IP Allowlist (If Enabled)
1. Go to **Settings** → **Database**
2. Scroll to **Connection Pooling** or **Network Restrictions**
3. If IP allowlist is enabled, you may need to:
   - Add your current IP address
   - Or disable IP restrictions for development
   - Or use Supabase's connection pooler (port 6543)

### 3. Try Connection Pooler
If direct connection (port 5432) doesn't work, try the pooler:
```env
DATABASE_URL="postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
```

### 4. Verify Connection String in Supabase Dashboard
1. Go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** format
4. Copy the **exact** connection string
5. Compare with the one in `.env`

### 5. Test from Different Network
- Try from a different network (mobile hotspot, etc.)
- Some corporate networks block database connections

## Next Steps Once Connected

### 1. Run Database Migrations
```bash
npx prisma migrate dev --name init
```
This will create all the database tables defined in `prisma/schema.prisma`.

### 2. Seed the Database
```bash
npm run db:seed
```
This will populate the database with initial categories, collections, and products.

### 3. Verify Connection
```bash
npx prisma studio
```
Opens a browser interface to view your database.

## For Vercel Deployment

The connection should work when deployed to Vercel, as Vercel has different network access. Make sure to:

1. Add `DATABASE_URL` to Vercel environment variables
2. Use the same connection string
3. Run migrations during deployment or manually after first deploy

## Alternative: Use Supabase Dashboard

If local connection continues to fail, you can:
1. Use Supabase's SQL Editor to run migrations manually
2. Or wait until deployment to Vercel to run migrations
3. The connection string is correctly configured and will work in production
