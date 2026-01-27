#!/bin/bash
# Patch resend type definitions to fix TypeScript build errors
# This fixes the 'react: void 0;' syntax error in resend@6.9.0

if [ -f "node_modules/resend/dist/index.d.mts" ]; then
  echo "Patching resend type definitions..."
  sed -i '' 's/react: void 0;/react?: React.ReactElement | string;/g' node_modules/resend/dist/index.d.mts
  echo "✓ Resend type definitions patched"
else
  echo "⚠ Resend type definitions not found, skipping patch"
fi
