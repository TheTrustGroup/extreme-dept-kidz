/**
 * Check Environment Variables
 *
 * Verifies required env vars (DATABASE_URL, JWT_SECRET) are set.
 * Run with: npm run check-env
 */

import { config } from 'dotenv';
import { resolve } from 'path';

try {
  config({ path: resolve(process.cwd(), '.env.local') });
} catch {
  // .env.local might not exist
}
try {
  config({ path: resolve(process.cwd(), '.env') });
} catch {
  // .env might not exist
}

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'] as const;
const optional = ['NEXT_PUBLIC_APP_URL', 'RESEND_API_KEY'] as const;

function main() {
  console.log('🔍 Checking environment variables...\n');

  let ok = true;
  for (const key of REQUIRED) {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      console.error(`❌ ${key} is not set or empty`);
      ok = false;
    } else {
      const preview =
        key === 'JWT_SECRET'
          ? `${val.slice(0, 8)}...`
          : key === 'DATABASE_URL'
            ? `postgresql://... (${val.length} chars)`
            : `${val.slice(0, 20)}...`;
      console.log(`✅ ${key}: ${preview}`);
    }
  }

  console.log('');
  for (const key of optional) {
    const val = process.env[key];
    console.log(val ? `✅ ${key}: (set)` : `⚠️  ${key}: (optional, not set)`);
  }

  console.log('');
  if (ok) {
    console.log('🎉 All required variables are set.');
    process.exit(0);
  } else {
    console.error('💡 Add missing vars to .env.local and re-run.');
    process.exit(1);
  }
}

main();
