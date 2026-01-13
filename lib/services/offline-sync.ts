/**
 * Offline Sync Service
 * 
 * Handles offline inventory updates and automatic syncing when connection is restored.
 */

export interface PendingInventoryUpdate {
  id: string;
  productId: string;
  productName: string;
  sizes: Array<{
    size: string;
    quantity: number;
    inStock: boolean;
  }>;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

const STORAGE_KEY = 'inventory-pending-updates';
const MAX_RETRIES = 3;
const SYNC_INTERVAL = 5000; // Check for sync every 5 seconds

class OfflineSyncService {
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private syncListeners: Set<(pendingCount: number) => void> = new Set();
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen to online/offline events
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners(true);
        this.attemptSync();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners(false);
      });

      // Start periodic sync check
      this.startPeriodicSync();
    }
  }

  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribe to online/offline status changes
   */
  onStatusChange(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current status
    callback(this.isOnline);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Subscribe to pending sync count changes
   */
  onPendingCountChange(callback: (count: number) => void): () => void {
    this.syncListeners.add(callback);
    // Immediately call with current count
    callback(this.getPendingUpdates().length);
    // Return unsubscribe function
    return () => {
      this.syncListeners.delete(callback);
    };
  }

  /**
   * Notify all status listeners
   */
  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(callback => callback(isOnline));
  }

  /**
   * Notify all sync listeners
   */
  private notifySyncListeners(): void {
    const count = this.getPendingUpdates().length;
    this.syncListeners.forEach(callback => callback(count));
  }

  /**
   * Get all pending updates from localStorage
   */
  getPendingUpdates(): PendingInventoryUpdate[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as PendingInventoryUpdate[];
    } catch (error) {
      console.error('Failed to read pending updates:', error);
      return [];
    }
  }

  /**
   * Save pending updates to localStorage
   */
  private savePendingUpdates(updates: PendingInventoryUpdate[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
      this.notifySyncListeners();
    } catch (error) {
      console.error('Failed to save pending updates:', error);
    }
  }

  /**
   * Add a new inventory update to the queue
   */
  queueUpdate(
    productId: string,
    productName: string,
    sizes: Array<{ size: string; quantity: number; inStock: boolean }>
  ): string {
    const update: PendingInventoryUpdate = {
      id: `update-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      productId,
      productName,
      sizes,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    const pending = this.getPendingUpdates();
    pending.push(update);
    this.savePendingUpdates(pending);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.attemptSync();
    }

    return update.id;
  }

  /**
   * Remove a pending update (after successful sync)
   */
  removeUpdate(updateId: string): void {
    const pending = this.getPendingUpdates();
    const filtered = pending.filter(u => u.id !== updateId);
    this.savePendingUpdates(filtered);
  }

  /**
   * Update the status of a pending update
   */
  private updateUpdateStatus(updateId: string, status: PendingInventoryUpdate['status']): void {
    const pending = this.getPendingUpdates();
    const update = pending.find(u => u.id === updateId);
    if (update) {
      update.status = status;
      if (status === 'syncing') {
        update.retryCount += 1;
      }
      this.savePendingUpdates(pending);
    }
  }

  /**
   * Attempt to sync pending updates
   */
  async attemptSync(): Promise<void> {
    if (!this.isOnline) {
      console.log('[OfflineSync] Offline - skipping sync');
      return;
    }

    const pending = this.getPendingUpdates().filter(u => u.status === 'pending' || u.status === 'failed');
    
    if (pending.length === 0) {
      return;
    }

    console.log(`[OfflineSync] Attempting to sync ${pending.length} pending updates...`);

    // Process updates one by one to avoid overwhelming the server
    for (const update of pending) {
      if (update.retryCount >= MAX_RETRIES) {
        console.warn(`[OfflineSync] Update ${update.id} exceeded max retries, marking as failed`);
        this.updateUpdateStatus(update.id, 'failed');
        continue;
      }

      try {
        this.updateUpdateStatus(update.id, 'syncing');
        
        // Try to sync via API
        const response = await fetch(`/api/admin/inventory/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: update.productId,
            sizes: update.sizes,
          }),
        });

        if (!response.ok) {
          throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
        }

        // Success - remove from pending
        console.log(`[OfflineSync] Successfully synced update ${update.id}`);
        this.removeUpdate(update.id);
      } catch (error) {
        console.error(`[OfflineSync] Failed to sync update ${update.id}:`, error);
        this.updateUpdateStatus(update.id, 'failed');
        
        // If it's a network error, stop trying (we're probably offline again)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          this.isOnline = false;
          this.notifyListeners(false);
          break;
        }
      }
    }

    // Notify listeners of updated count
    this.notifySyncListeners();
  }

  /**
   * Start periodic sync check
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.attemptSync();
      }
    }, SYNC_INTERVAL);
  }

  /**
   * Manually trigger sync
   */
  async manualSync(): Promise<{ success: number; failed: number }> {
    const beforeCount = this.getPendingUpdates().length;
    await this.attemptSync();
    const afterCount = this.getPendingUpdates().length;
    const synced = beforeCount - afterCount;
    
    return {
      success: synced,
      failed: afterCount,
    };
  }

  /**
   * Clear all pending updates (use with caution)
   */
  clearPendingUpdates(): void {
    this.savePendingUpdates([]);
  }

  /**
   * Get failed updates
   */
  getFailedUpdates(): PendingInventoryUpdate[] {
    return this.getPendingUpdates().filter(u => u.status === 'failed');
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();
