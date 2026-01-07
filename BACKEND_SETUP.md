# Backend Setup Guide

## Quick Start

### Step 1: Set Up Database

Choose one of these free database options:

#### Option A: Supabase (Recommended - Easiest)
1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### Option B: Neon (Serverless PostgreSQL)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string

#### Option C: Railway ($5/month)
1. Go to https://railway.app
2. Create account
3. New Project → Add PostgreSQL
4. Copy the DATABASE_URL from variables

### Step 2: Configure Environment Variables

1. Create a `.env` file in the root directory (copy from `.env.example` if it exists)
2. Add your database URL:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### Step 3: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### Step 4: Seed Database with Initial Data

```bash
# Run the seed script (we'll create this)
npm run seed
```

## Database Schema Overview

The schema includes:

- **Categories**: Product categories (Boys, Girls, Accessories, etc.)
- **Collections**: Product collections (New Arrivals, Street Essentials, etc.)
- **Products**: Main product catalog
- **ProductVariants**: Size/color variants with inventory tracking
- **ProductImages**: Product image URLs
- **ProductTags**: Tags like "new", "sale", "bestseller"
- **InventoryLog**: Track all inventory changes
- **Orders**: Customer orders
- **OrderItems**: Items in each order
- **Users**: Customer accounts (for future auth)

## API Endpoints Created

### Products
- `GET /api/products` - List all products (with filters)
- `GET /api/products/[slug]` - Get single product

### Inventory
- `GET /api/inventory/[productId]` - Get inventory for a product

## Next Steps

1. **Set up database** (choose one of the options above)
2. **Run migrations** (`npx prisma migrate dev`)
3. **Seed database** (run seed script)
4. **Test API endpoints** (visit `/api/products` in browser)
5. **Replace mock data** in frontend with API calls

## Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Ensure database is running (for local) or accessible (for cloud)
- Check firewall/network settings

### "Schema validation error"
- Make sure you ran `npx prisma generate` after schema changes
- Restart your dev server

### "Table does not exist"
- Run `npx prisma migrate dev` to create tables

## Development Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Format Prisma schema
npx prisma format
```

