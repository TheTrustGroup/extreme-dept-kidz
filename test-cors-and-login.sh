#!/usr/bin/env bash
# Test CORS and login endpoint for warehouse.extremedeptkidz.com
# Run from project root. Requires curl.
#
# Usage: ./test-cors-and-login.sh [BASE_URL]
# Example: ./test-cors-and-login.sh https://extremedeptkidz.com

set -e
BASE="${1:-https://extremedeptkidz.com}"
ORIGIN="https://warehouse.extremedeptkidz.com"
LOGIN_URL="${BASE}/admin/api/login"

echo "=============================================="
echo "CORS & Login test"
echo "  API base: $BASE"
echo "  Origin:   $ORIGIN"
echo "  Login:    $LOGIN_URL"
echo "=============================================="
echo ""

echo "1. OPTIONS (CORS preflight)"
echo "   curl -X OPTIONS \"$LOGIN_URL\" -H \"Origin: $ORIGIN\" ..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$LOGIN_URL" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")
echo "   Status: $CODE (expect 200 or 204)"
if [ "$CODE" != "200" ] && [ "$CODE" != "204" ]; then
  echo "   WARNING: Expected 200/204 for OPTIONS"
fi

echo ""
echo "2. OPTIONS – response headers (CORS)"
curl -s -D - -o /dev/null -X OPTIONS "$LOGIN_URL" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" | grep -i "access-control" || true
echo "   Check: Access-Control-Allow-Origin: $ORIGIN"
echo "   Check: Access-Control-Allow-Credentials: true"
echo ""

echo "3. POST login (invalid credentials – expect 401/422 with JSON)"
echo "   curl -X POST \"$LOGIN_URL\" -H \"Content-Type: application/json\" -d '{\"email\":\"test@test.com\",\"password\":\"test\"}' ..."
CODE=$(curl -s -o /tmp/login-response.json -w "%{http_code}" -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Origin: $ORIGIN" \
  -d '{"email":"test@test.com","password":"test"}')
echo "   Status: $CODE (expect 401 or 422)"
echo "   Body (first 500 chars):"
head -c 500 /tmp/login-response.json | tr -d '\n'
echo ""
echo ""

if [ "$CODE" = "000" ] || [ "$CODE" = "" ]; then
  echo "FAIL: No response (connection/timeout/DNS). Fix server reachability first."
  exit 1
fi
if [ "$CODE" != "200" ] && [ "$CODE" != "401" ] && [ "$CODE" != "422" ]; then
  echo "WARN: Login returned $CODE; 401/422 with JSON is normal for invalid credentials."
fi

echo "=============================================="
echo "Done. If CORS headers show warehouse origin and credentials, and POST returns JSON, you’re good."
echo "=============================================="
