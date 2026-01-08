# Running Database Migrations on Vercel

## ✅ Environment Variable Added
You've successfully added `DATABASE_URL` to Vercel environment variables. Now let's run the migrations!

## Option 1: Run Migrations via Vercel CLI (Recommended)

### Step 1: Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Your Project (if not already linked)
```bash
vercel link
```

### Step 4: Run Migrations Using Vercel Environment
```bash
# This will use the DATABASE_URL from Vercel environment variables
vercel env pull .env.local
npx prisma migrate deploy
```

Or run directly with Vercel's environment:
```bash
vercel exec -- npx prisma migrate deploy
```

## Option 2: Run Migrations After Deployment

### Step 1: Deploy to Vercel
```bash
git push origin main
# Or
vercel --prod
```

### Step 2: Run Migrations via Vercel CLI
After deployment, run:
```bash
vercel exec -- npx prisma migrate deploy
```

### Step 3: Seed Database (Optional)
```bash
vercel exec -- npm run db:seed
```

## Option 3: Create a Migration API Route (One-Time Use)

Create `app/api/migrate/route.ts` to run migrations via API (⚠️ Remove after use for security):

```typescript
import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  // Add a secret key check for security
  const { secret } = await request.json();
  
  if (secret !== process.env.MIGRATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy");
    return NextResponse.json({ 
      success: true, 
      output: stdout,
      error: stderr 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
```

Then call it once:
```bash
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret-key"}'
```

**⚠️ Remember to delete this route after migrations are complete!**

## Option 4: Manual SQL via Supabase Dashboard

If migrations fail, you can run SQL manually:

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from migration files (once created)
3. Or create tables manually using Supabase's table editor

## Recommended Approach

**For Production:**
1. Use Vercel CLI: `vercel exec -- npx prisma migrate deploy`
2. This ensures migrations run with production environment variables
3. Run once after first deployment

**For Future Migrations:**
1. Create migration locally: `npx prisma migrate dev --name migration_name`
2. Commit migration files to git
3. Deploy to Vercel
4. Run: `vercel exec -- npx prisma migrate deploy`

## Verify Migrations

After migrations succeed, verify tables were created:

```bash
# View database schema
vercel exec -- npx prisma studio
```

Or check via Supabase Dashboard → Table Editor

## Next Steps

1. ✅ Environment variable added to Vercel
2. ⏭️ Run migrations (choose one of the options above)
3. ⏭️ Seed database with initial data
4. ⏭️ Test API endpoints (`/api/products`, etc.)
5. ⏭️ Replace mock data in frontend with API calls

## Troubleshooting

### "Migration failed"
- Check DATABASE_URL is correct in Vercel
- Verify database is accessible from Vercel's network
- Check Supabase logs for connection errors

### "Can't reach database server"
- Ensure Supabase project is active
- Check if IP restrictions are blocking Vercel's IPs
- Try using connection pooler (port 6543)

### "Table already exists"
- Database might already have tables
- Use `prisma migrate reset` to start fresh (⚠️ deletes all data)
- Or use `prisma migrate deploy` which handles existing migrations
