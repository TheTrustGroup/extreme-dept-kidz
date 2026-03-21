#!/bin/bash
# scripts/consistency-audit.sh
# Final consistency audit — run before handoff

PASS=0
FAIL=0

check() {
  local label="$1"
  local count="$2"
  local message="$3"
  if [ "$count" -eq 0 ]; then
    echo "  ✓ $label"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $label — $count instance(s) found: $message"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EDK Design System Consistency Audit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "▸ Copy voice..."
COUNT=$(grep -r '"Add to Cart"\|Add to Cart' app/ components/ --include="*.tsx" 2>/dev/null | grep -v ".sh\|node_modules\|DESIGN_SYSTEM" | wc -l | tr -d ' ')
check "No 'Add to Cart' (should be 'Add to Bag')" "$COUNT" "fix to 'Add to Bag'"

COUNT=$(grep -r '"Your Cart"\|Your Cart' app/ components/ --include="*.tsx" 2>/dev/null | grep -v ".sh\|node_modules\|DESIGN_SYSTEM" | wc -l | tr -d ' ')
check "No 'Your Cart' (should be 'Your Bag')" "$COUNT" "fix to 'Your Bag'"

COUNT=$(grep -r '"Submit Order"\|Submit Order' app/ components/ --include="*.tsx" 2>/dev/null | grep -v ".sh\|node_modules\|DESIGN_SYSTEM" | wc -l | tr -d ' ')
check "No 'Submit Order' (should be 'Place Order')" "$COUNT" "fix to 'Place Order'"

echo ""
echo "▸ Design tokens..."
COUNT=$(grep -rn "color: #\|background: #\|background-color: #" components/ app/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "var(--\|/\*\|node_modules" | wc -l | tr -d ' ')
check "No hardcoded hex in component files" "$COUNT" "use CSS variables instead"

COUNT=$(grep -rn "font-size: [0-9]*px" components/ --include="*.tsx" 2>/dev/null | grep -v "node_modules\|//" | wc -l | tr -d ' ')
check "No inline font-size in components" "$COUNT" "use type scale classes"

echo ""
echo "▸ Accessibility..."
COUNT=$(grep -rn "<img " app/ components/ --include="*.tsx" 2>/dev/null | grep -v "alt=\|node_modules" | wc -l | tr -d ' ')
check "No <img> tags missing alt" "$COUNT" "add alt attribute"

echo "  ℹ  Verify all icon-only buttons have aria-label (manual check)"

COUNT=$(grep -rn "onClick=" app/ components/ --include="*.tsx" 2>/dev/null | grep -v "button\|a \|Link\|node_modules" | wc -l | tr -d ' ')
check "No onClick on non-interactive elements" "$COUNT" "use button or Link"

echo ""
echo "▸ Image optimisation..."
COUNT=$(grep -rn "<img " app/ components/ --include="*.tsx" 2>/dev/null | grep -v "node_modules\|//" | wc -l | tr -d ' ')
check "No plain <img> tags (use Next.js <Image>)" "$COUNT" "replace with <Image>"

COUNT=$(grep -rn "priority" components/home/HeroSection.tsx 2>/dev/null | wc -l | tr -d ' ')
check "Hero image has priority prop" "$([ "$COUNT" -gt 0 ] && echo 0 || echo 1)" "add priority to hero <Image>"

echo ""
echo "▸ Zustand + store..."
COUNT=$(grep -rn "console\.log" app/ components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "webVitals\|node_modules\|\.sh" | wc -l | tr -d ' ')
check "No console.log in production code" "$COUNT" "remove before deploy"

echo ""
echo "▸ Routing..."
COUNT=$(find app -name "page.tsx" 2>/dev/null | xargs grep -l "export default" 2>/dev/null | wc -l | tr -d ' ')
echo "  ℹ  $COUNT pages with default exports found"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Results: $PASS passed · $FAIL failed"
if [ "$FAIL" -eq 0 ]; then
  echo "  🎉 All checks passed — ready for handoff"
else
  echo "  ⚠️  Fix $FAIL issue(s) before handoff"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
