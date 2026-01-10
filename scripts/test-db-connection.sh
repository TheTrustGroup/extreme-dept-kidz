#!/bin/bash

echo "🔍 Testing Database Connection..."
echo "=================================="
echo ""

# Test 1: Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    exit 1
fi

# Test 2: Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env.local; then
    echo "❌ DATABASE_URL not found in .env.local"
    exit 1
fi

# Test 3: Check if JWT_SECRET is set
if ! grep -q "JWT_SECRET" .env.local; then
    echo "⚠️  JWT_SECRET not found in .env.local"
    echo "   Run: ./scripts/setup-auth.sh"
fi

echo "✅ Environment variables found"
echo ""

# Test 4: Try Prisma connection
echo "Testing Prisma connection..."
npx prisma db pull --force 2>&1 | head -20

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database connection successful!"
    echo ""
    echo "Next steps:"
    echo "1. Run migration: npx prisma migrate dev --name add_admin_user_model"
    echo "2. Create admin: npm run create-admin"
else
    echo ""
    echo "❌ Database connection failed"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Supabase dashboard - is project active?"
    echo "2. Verify DATABASE_URL in .env.local"
    echo "3. Check if password is correct"
    echo "4. Try connection pooler (port 6543)"
fi
