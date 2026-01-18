/**
 * Reset Admin Password via Supabase Auth API
 * 
 * This script uses Supabase's admin API to reset a user's password.
 * 
 * SECURITY: Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 * 
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your-key-here npm run reset-password-supabase -- user@example.com
 * 
 * Or set in .env.local:
 *   SUPABASE_SERVICE_ROLE_KEY=your-key-here
 *   npm run reset-password-supabase -- user@example.com
 */

// Load environment variables from .env.local if it exists
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env.local file (silently fail if it doesn't exist)
config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = 'https://puuszplmdbindiesfxlr.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function resetPassword(email: string): Promise<void> {
  if (!SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Set it in your environment or .env.local file.'
    );
  }

  if (!email || !email.includes('@')) {
    throw new Error('Valid email address is required');
  }

  console.log(`🔄 Resetting password for: ${email}`);

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/password/reset`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    // Get response text first to handle non-JSON responses
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // If response is not JSON, show the raw response
      console.error('❌ API returned non-JSON response:');
      console.error('Status:', response.status, response.statusText);
      console.error('Response:', responseText);
      
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          'Authentication failed. Please check:\n' +
          '1. SUPABASE_SERVICE_ROLE_KEY is correct\n' +
          '2. The key is a Service Role Key (not anon key)\n' +
          '3. The key has not expired\n' +
          `\nResponse: ${responseText}`
        );
      }
      throw new Error(`Invalid response from API: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(`Password reset failed (${response.status}): ${JSON.stringify(data)}`);
    }

    console.log('✅ Password reset email sent successfully!');
    console.log('📧 Check the email inbox for:', email);
    console.log('📋 Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    throw error;
  }
}

// Main execution
const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: npm run reset-password-supabase -- user@example.com');
  console.error('   Or: SUPABASE_SERVICE_ROLE_KEY=key npm run reset-password-supabase -- user@example.com');
  process.exit(1);
}

resetPassword(email)
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
