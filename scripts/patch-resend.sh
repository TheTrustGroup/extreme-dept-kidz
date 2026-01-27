#!/bin/bash
# Patch resend type definitions to fix TypeScript build errors
# This fixes the 'react: void 0;' syntax error in resend@6.9.0

if [ -f "node_modules/resend/dist/index.d.mts" ]; then
  echo "Patching resend type definitions..."
  # Cross-platform sed: macOS uses -i '', Linux uses -i
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/react: void 0;/react?: React.ReactElement | string;/g' node_modules/resend/dist/index.d.mts
  else
    sed -i 's/react: void 0;/react?: React.ReactElement | string;/g' node_modules/resend/dist/index.d.mts
  fi
  echo "✓ Resend type definitions patched"
else
  echo "⚠ Resend type definitions not found, skipping patch"
fi
