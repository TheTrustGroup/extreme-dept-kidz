/**
 * React Hooks for Supabase Realtime
 * 
 * Provides easy-to-use hooks for common Realtime patterns:
 * - Listening to database changes
 * - Broadcasting messages
 * - Tracking presence
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook to listen to database table changes
 * 
 * @example
 * const products = useRealtimeTable<Product>('Product', {
 *   event: 'UPDATE',
 *   filter: 'id=eq.123'
 * });
 */
export function useRealtimeTable<T>(
  tableName: string,
  options: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    schema?: string;
  } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: options.schema || 'public',
          table: tableName,
          ...(options.filter && { filter: options.filter }),
        },
        (payload) => {
          console.log(`[Realtime] ${tableName} changed:`, payload);

          if (payload.eventType === 'INSERT') {
            setData((prev) => [...prev, payload.new as T]);
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item: any) =>
                item.id === payload.new.id ? (payload.new as T) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((prev) =>
              prev.filter((item: any) => item.id !== (payload.old as any).id)
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [tableName, options.event, options.filter, options.schema]);

  return data;
}

/**
 * Hook to broadcast messages between clients
 * 
 * @example
 * const { sendMessage } = useBroadcast('admin-notifications');
 * sendMessage({ type: 'order-updated', orderId: '123' });
 */
export function useBroadcast(channelName: string) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName, {
      config: { private: true }, // Private channel requires RLS
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelName]);

  const sendMessage = async (payload: Record<string, unknown>) => {
    if (!channelRef.current) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload,
    });
  };

  return { sendMessage };
}

/**
 * Hook to track user presence
 * 
 * @example
 * const { onlineUsers } = usePresence('admin-presence', userId);
 */
export function usePresence(channelName: string, userId: string) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, unknown>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Presence] User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Presence] User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: userId,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelName, userId]);

  return { onlineUsers };
}
