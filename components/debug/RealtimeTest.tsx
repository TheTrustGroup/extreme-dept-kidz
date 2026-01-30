/**
 * Realtime Test Component
 * 
 * Tests Supabase Realtime functionality by listening to Product table changes.
 * Add this to your homepage to verify Realtime is working.
 * 
 * Usage:
 * <RealtimeTest />
 */

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  inStock: boolean;
  updatedAt: string;
}

export function RealtimeTest(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<string>('Connecting...');
  const [lastChange, setLastChange] = useState<string>('');

  useEffect(() => {
    // Initial fetch
    const fetchProducts = async () => {
      try {
        // Try both capitalized and lowercase table names (PostgreSQL can be case-sensitive)
        let data, error;
        
        // First try capitalized (matching Prisma model name)
        const result1 = await supabase
          .from('Product')
          .select('id, name, slug, price, "inStock", "updatedAt"')
          .limit(10)
          .order('updatedAt', { ascending: false });
        
        if (result1.error && result1.error.message.includes('does not exist')) {
          // If capitalized doesn't work, try lowercase
          const result2 = await supabase
            .from('product')
            .select('id, name, slug, price, "inStock", "updatedAt"')
            .limit(10)
            .order('updatedAt', { ascending: false });
          
          data = result2.data;
          error = result2.error;
        } else {
          data = result1.data;
          error = result1.error;
        }

        if (error) {
          console.error('[RealtimeTest] Fetch error:', error);
          setStatus(`Error: ${error.message}`);
          return;
        }

        setProducts(data || []);
        setStatus('Connected');
      } catch (err) {
        console.error('[RealtimeTest] Fetch failed:', err);
        setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    fetchProducts();

    // Listen for changes
    // Note: Table name should match what's enabled in Supabase Dashboard → Database → Replication
    // Try 'Product' first (matching Prisma model), fallback to 'product' if needed
    const channel = supabase
      .channel('realtime-test-products')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'Product', // Use capitalized table name matching Prisma model
          // If this doesn't work, try 'product' (lowercase) - depends on how Prisma created the table
        },
        (payload) => {
          console.log('🔥 PRODUCT CHANGED!', payload);
          setLastChange(
            `${payload.eventType} at ${new Date().toLocaleTimeString()}`
          );
          
          // Refetch products when changes detected
          fetchProducts();
        }
      )
      .subscribe((subscriptionStatus) => {
        console.log('[RealtimeTest] Subscription status:', subscriptionStatus);
        
        if (subscriptionStatus === 'SUBSCRIBED') {
          setStatus('✅ Subscribed to Product changes');
        } else if (subscriptionStatus === 'CHANNEL_ERROR') {
          setStatus('❌ Channel error - check Supabase Realtime is enabled');
        } else if (subscriptionStatus === 'TIMED_OUT') {
          setStatus('⏱️ Connection timed out');
        } else {
          setStatus(`Status: ${subscriptionStatus}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-2">🔴 Realtime Test</h3>
      <div className="text-xs space-y-1">
        <div>
          <strong>Status:</strong> {status}
        </div>
        {lastChange && (
          <div className="text-green-600">
            <strong>Last Change:</strong> {lastChange}
          </div>
        )}
        <div>
          <strong>Products:</strong> {products.length}
        </div>
        {products.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto">
            {products.slice(0, 3).map((p) => (
              <div key={p.id} className="text-xs truncate">
                • {p.name}
              </div>
            ))}
            {products.length > 3 && (
              <div className="text-xs text-gray-500">
                ...and {products.length - 3} more
              </div>
            )}
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          Edit a product in admin to test
        </div>
      </div>
    </div>
  );
}
