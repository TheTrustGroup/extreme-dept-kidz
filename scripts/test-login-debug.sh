#!/bin/bash

# Test Login Debug Script
# This script tests the debug-login endpoint to diagnose login issues

echo "🔍 Testing Admin Login Debug Endpoint"
echo "======================================"
echo ""

# Get domain from user or use default
if [ -z "$1" ]; then
    echo "Usage: ./scripts/test-login-debug.sh <domain> [email] [password]"
    echo "Example: ./scripts/test-login-debug.sh extremedeptkidz.com admin@extremedeptkidz.com Admin@2024!"
    exit 1
fi

DOMAIN="$1"
EMAIL="${2:-admin@extremedeptkidz.com}"
PASSWORD="${3:-Admin@2024!}"

echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Password: [hidden]"
echo ""

# Determine if it's a custom domain or Vercel domain
if [[ "$DOMAIN" == *".vercel.app" ]]; then
    URL="https://$DOMAIN/api/admin/auth/debug-login"
else
    URL="https://$DOMAIN/api/admin/auth/debug-login"
fi

echo "Testing: $URL"
echo ""

# Make the request
RESPONSE=$(curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Check if curl was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to server"
    exit 1
fi

# Pretty print JSON response
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo "======================================"
echo "✅ Debug test complete"
echo ""
echo "If login is failing, check the 'diagnostics' section above"
echo "for specific recommendations on how to fix it."
