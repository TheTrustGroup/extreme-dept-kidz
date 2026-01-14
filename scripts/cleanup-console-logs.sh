#!/bin/bash

# Script to replace console.log/warn/info with logger equivalents
# Keeps console.error for actual errors

echo "🧹 Cleaning up console.log statements..."

# Find all TypeScript/TSX files (excluding node_modules, .next, etc.)
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.next/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./build/*" \
  -not -path "./tests/*" \
  -not -name "*.test.ts" \
  -not -name "*.test.tsx" \
  | while read file; do
  
  # Check if file uses console.log/warn/info
  if grep -q "console\.\(log\|warn\|info\)" "$file"; then
    echo "Processing: $file"
    
    # Check if logger is already imported
    if ! grep -q "from '@/lib/utils/logger'" "$file" && ! grep -q 'from "@/lib/utils/logger"' "$file"; then
      # Add import after other imports
      if grep -q "^import" "$file"; then
        # Find last import line
        last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
        # Add logger import after last import
        sed -i '' "${last_import}a\\
import { logger } from '@/lib/utils/logger';
" "$file"
      else
        # Add at top if no imports
        sed -i '' "1i\\
import { logger } from '@/lib/utils/logger';
\\
" "$file"
      fi
    fi
    
    # Replace console.log with logger.log
    sed -i '' 's/console\.log(/logger.log(/g' "$file"
    
    # Replace console.warn with logger.warn
    sed -i '' 's/console\.warn(/logger.warn(/g' "$file"
    
    # Replace console.info with logger.info
    sed -i '' 's/console\.info(/logger.info(/g' "$file"
    
    # Note: We keep console.error as-is (or can replace with logger.error)
    # Uncomment next line if you want to replace console.error too:
    # sed -i '' 's/console\.error(/logger.error(/g' "$file"
    
    echo "  ✅ Updated $file"
  fi
done

echo ""
echo "✅ Console.log cleanup complete!"
echo ""
echo "⚠️  Please review the changes and test your application."
echo "⚠️  Some console.log statements may be intentional (debug endpoints, etc.)"
