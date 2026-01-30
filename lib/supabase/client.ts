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

// Check if we're in build/prerender phase
const isBuildTime = 
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build' ||
  typeof window === 'undefined' && !process.env.VERCEL; // During build, window is undefined but VERCEL env might not be set

if (!supabaseUrl || !supabaseAnonKey) {
  // During build time, always create a mock client to prevent build failures
  // The actual client will be initialized at runtime when env vars are available
  if (isBuildTime) {
    // Create a mock client that won't crash during build
    supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key');
  } else if (process.env.NODE_ENV === 'production') {
    // In production runtime (not build), throw error if vars are missing
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.'
    );
  } else {
    // In development, create a mock client that won't crash
    console.warn(
      '[Supabase] Missing environment variables. ' +
      'Realtime features will be disabled. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
    
    // Create a mock client that won't crash but won't work
    supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
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
