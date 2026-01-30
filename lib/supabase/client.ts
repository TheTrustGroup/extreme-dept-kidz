/**
 * Supabase Client for Realtime Features
 * 
 * Use this client for:
 * - Real-time database subscriptions
 * - Broadcast messages
 * - Presence tracking
 * 
 * Note: This is separate from Prisma which handles regular database queries.
 * Realtime features require the Supabase client library.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient>;

if (!supabaseUrl || !supabaseAnonKey) {
  // Only throw error in production - in development, allow graceful degradation
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.'
    );
  }
  
  // In development, create a mock client that won't crash
  console.warn(
    '[Supabase] Missing environment variables. ' +
    'Realtime features will be disabled. ' +
    'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
  
  // Create a mock client that won't crash but won't work
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key');
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10, // Rate limit for Realtime events
      },
    },
  });
}

export const supabase = supabaseClient;
