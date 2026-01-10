#!/bin/bash

# Setup script for secure authentication system
# This script helps set up JWT_SECRET and provides database connection guidance

echo "🔐 Setting up Secure Authentication System"
echo "=========================================="
echo ""

# Generate JWT_SECRET
echo "📝 Generating JWT_SECRET..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "Generated JWT_SECRET: $JWT_SECRET"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found. Creating it..."
    touch .env.local
fi

# Check if JWT_SECRET already exists
if grep -q "JWT_SECRET" .env.local; then
    echo "⚠️  JWT_SECRET already exists in .env.local"
    echo "Current value:"
    grep "JWT_SECRET" .env.local
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove old JWT_SECRET line
        sed -i '' '/^JWT_SECRET=/d' .env.local
        # Add new JWT_SECRET
        echo "JWT_SECRET=$JWT_SECRET" >> .env.local
        echo "JWT_EXPIRES_IN=7d" >> .env.local
        echo "✅ JWT_SECRET updated in .env.local"
    fi
else
    echo "✅ Adding JWT_SECRET to .env.local"
    echo "" >> .env.local
    echo "# JWT Authentication" >> .env.local
    echo "JWT_SECRET=$JWT_SECRET" >> .env.local
    echo "JWT_EXPIRES_IN=7d" >> .env.local
    echo "✅ JWT_SECRET added to .env.local"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Fix Database Connection:"
echo "   - Check Supabase dashboard to ensure database is active"
echo "   - Verify DATABASE_URL in .env.local is correct"
echo "   - Try adding ?sslmode=require to DATABASE_URL if not present"
echo ""
echo "2. Run Migration:"
echo "   npx prisma migrate dev --name add_admin_user_model"
echo ""
echo "3. Create Admin User:"
echo "   npm run create-admin admin@extremedeptkidz.com \"YourPassword123!\" \"Admin Name\""
echo ""
echo "4. Test Login:"
echo "   - Go to /admin/login"
echo "   - Use the credentials you created"
echo ""
