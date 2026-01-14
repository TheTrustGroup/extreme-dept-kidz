#!/bin/bash

# Vercel Deployment Script
# This script attempts to deploy to Vercel production

echo "🚀 Attempting to deploy to Vercel..."
echo "⏰ Current time: $(date)"
echo ""

# Try to deploy
vercel --prod --yes

# Check exit status
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "📝 Check your Vercel dashboard for deployment status"
else
    echo ""
    echo "❌ Deployment failed or limit not reset yet"
    echo "💡 If you see 'Resource is limited', wait a bit longer and try again"
    echo "💡 You can also check: https://vercel.com/dashboard"
fi
