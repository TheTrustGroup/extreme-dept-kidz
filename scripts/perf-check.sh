#!/bin/bash
# scripts/perf-check.sh
# Run before each production deployment

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EDK Performance Pre-deploy Checklist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Build size check
echo ""
echo "▸ Building..."
npm run build 2>&1 | tail -30

# 2. Check for console.log in production code
echo ""
echo "▸ Checking for console.log..."
LOGS=$(grep -r "console\.log" app/ components/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "webVitals\|perf-check\|node_modules" | wc -l | tr -d ' ')
if [ "$LOGS" -gt 0 ]; then
  echo "  ⚠️  Found $LOGS console.log statement(s):"
  grep -r "console\.log" app/ components/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "webVitals\|perf-check\|node_modules" || true
else
  echo "  ✓ No console.log found"
fi

# 3. Check for missing alt text
echo ""
echo "▸ Checking for Image components without alt..."
MISSING_ALT=$(grep -rn "<Image" app/ components/ --include="*.tsx" 2>/dev/null | grep -v 'alt=' | wc -l | tr -d ' ')
if [ "$MISSING_ALT" -gt 0 ]; then
  echo "  ⚠️  Found $MISSING_ALT Image(s) without alt attribute"
else
  echo "  ✓ All images have alt attributes"
fi

# 4. Check for missing priority on hero/above-fold images
echo ""
echo "▸ Checking hero images for priority prop..."
HERO_PRIORITY=$(grep -n "priority" components/home/HeroSection.tsx 2>/dev/null | wc -l | tr -d ' ')
if [ "$HERO_PRIORITY" -gt 0 ]; then
  echo "  ✓ Hero image has priority prop"
else
  echo "  ⚠️  Hero image missing priority prop — will hurt LCP"
fi

# 5. Check bundle size
echo ""
echo "▸ Checking .next/static for large chunks..."
if [ -d ".next/static/chunks" ]; then
  find .next/static/chunks -name "*.js" -size +500k 2>/dev/null | while read f; do
    SIZE=$(du -sh "$f" 2>/dev/null | cut -f1)
    echo "  ⚠️  Large chunk: $f ($SIZE)"
  done
  LARGE=$(find .next/static/chunks -name "*.js" -size +500k 2>/dev/null | wc -l | tr -d ' ')
  if [ "$LARGE" -eq 0 ]; then
    echo "  ✓ No chunks over 500KB"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Run 'ANALYZE=true npm run build' for bundle analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
