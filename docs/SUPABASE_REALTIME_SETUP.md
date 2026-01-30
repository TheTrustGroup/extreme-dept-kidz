# Supabase Realtime Setup Guide

## Overview

Supabase Realtime allows you to listen to database changes in real-time, send broadcast messages, and track user presence. This is useful for:
- Live product updates
- Real-time order notifications
- Live inventory changes
- Admin dashboard updates

## Step 1: Enable Realtime in Supabase Dashboard

1. **Go to Supabase Dashboard** → Your Project
2. **Navigate to Database** → **Replication**
3. **Enable Realtime** for tables you want to monitor:
   - ✅ `Product` - for live product updates
   - ✅ `Order` - for real-time order notifications
   - ✅ `AdminUser` - for admin activity tracking
   - Or enable globally for all tables

**Alternative:** Enable globally in **Settings** → **API** → **Realtime** (enable toggle)

## Step 2: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 3: Create Supabase Client Utility

Create `lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Step 4: Add Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: **Supabase Dashboard** → **Settings** → **API**

## Step 5: Set Up Row Level Security (RLS)

For private channels, enable RLS on your tables:

```sql
-- Enable RLS on Product table
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

-- Example: Allow public read access
CREATE POLICY "Public read access" ON "Product"
  FOR SELECT USING (true);

-- Example: Allow admin write access
CREATE POLICY "Admin write access" ON "Product"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "AdminUser"
      WHERE "AdminUser".id = auth.uid()
      AND "AdminUser".role IN ('admin', 'super_admin')
    )
  );
```

## Step 6: Use Realtime in Your Components

### Example: Listen to Product Changes

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Product } from '@/types';

export function ProductRealtimeListener() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Subscribe to Product table changes
    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'Product',
        },
        (payload) => {
          console.log('Product changed:', payload);
          
          if (payload.eventType === 'INSERT') {
            setProducts((prev) => [...prev, payload.new as Product]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new as Product : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <div>{/* Render products */}</div>;
}
```

### Example: Broadcast Messages (Admin Notifications)

```typescript
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function AdminNotificationChannel() {
  useEffect(() => {
    const channel = supabase.channel('admin-notifications', {
      config: { private: true }, // Private channel requires RLS
    });

    // Listen for broadcast messages
    channel.on('broadcast', { event: 'notification' }, (payload) => {
      console.log('Admin notification:', payload);
      // Show notification to admin user
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Send a broadcast message
  const sendNotification = async (message: string) => {
    const channel = supabase.channel('admin-notifications');
    await channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: { message, timestamp: new Date() },
    });
  };

  return null;
}
```

### Example: Presence Tracking (Who's Online)

```typescript
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function PresenceTracker({ userId }: { userId: string }) {
  useEffect(() => {
    const channel = supabase.channel('admin-presence', {
      config: { presence: { key: userId } },
    });

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Online users:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Set your presence
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: userId,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
}
```

## Step 7: Use Cases for Your E-commerce Platform

### 1. Real-time Product Updates
- Listen to `Product` table changes
- Update product listings without page refresh
- Show low stock alerts in real-time

### 2. Order Status Updates
- Listen to `Order` table changes
- Update order status in admin dashboard
- Notify customers when order status changes

### 3. Admin Activity Feed
- Broadcast admin actions (product created, order updated)
- Show live activity feed in admin dashboard
- Track who's currently online

### 4. Inventory Management
- Real-time stock level updates
- Alert when products go out of stock
- Sync inventory across multiple admin sessions

## Security Considerations

1. **Row Level Security (RLS)**: Always enable RLS for tables exposed via Realtime
2. **Private Channels**: Use private channels for sensitive data (admin notifications)
3. **Authentication**: Verify user authentication before subscribing to channels
4. **Rate Limiting**: Supabase has built-in rate limiting, but monitor usage

## Troubleshooting

### Realtime not working?
1. Check if Realtime is enabled in Supabase Dashboard → Database → Replication
2. Verify RLS policies allow the operation
3. Check browser console for connection errors
4. Verify environment variables are set correctly

### Connection issues?
- Check Supabase project status (not paused)
- Verify network connectivity
- Check Supabase Dashboard → Logs for errors

## Next Steps

1. Enable Realtime in Supabase Dashboard
2. Install `@supabase/supabase-js`
3. Create Supabase client utility
4. Add environment variables
5. Set up RLS policies
6. Implement Realtime listeners in your components

## Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Realtime Getting Started](https://supabase.com/docs/guides/realtime/getting_started)
- [Broadcast Guide](https://supabase.com/docs/guides/realtime/broadcast)
- [Presence Guide](https://supabase.com/docs/guides/realtime/presence)
