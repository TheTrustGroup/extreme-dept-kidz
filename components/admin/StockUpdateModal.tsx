'use client';

import { useState, useEffect } from 'react';
import { X, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { ProductSize } from "@/types";
import { DEFAULT_PRODUCT_SIZES } from "@/lib/constants/product-sizes";
import { offlineSyncService } from "@/lib/services/offline-sync";

interface StockUpdateModalProps {
  productId: string;
  productName: string;
  sizes: ProductSize[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (productId: string, sizes: ProductSize[]) => void;
}

export function StockUpdateModal({ 
  productId, 
  productName, 
  sizes: initialSizes, 
  isOpen, 
  onClose, 
  onUpdate 
}: StockUpdateModalProps) {
  // Ensure all default sizes are present, matching the add product component structure
  const [sizes, setSizes] = useState<ProductSize[]>(() => {
    const sizesMap = new Map<string, ProductSize>();
    initialSizes.forEach(size => {
      sizesMap.set(size.size, size);
    });

    // Create array with all default sizes, using existing data or defaults
    return DEFAULT_PRODUCT_SIZES.map(size => {
      const existingSize = sizesMap.get(size);
      if (existingSize) {
        return {
          ...existingSize,
          quantity: existingSize.quantity ?? 0,
          inStock: (existingSize.quantity ?? 0) > 0,
        };
      }
      // If size doesn't exist, create it with 0 quantity
      return {
        size,
        inStock: false,
        quantity: 0,
      };
    });
  });

  const [isOnline, setIsOnline] = useState(true);

  // Update sizes when initialSizes changes
  useEffect(() => {
    if (isOpen) {
      const sizesMap = new Map<string, ProductSize>();
      initialSizes.forEach(size => {
        sizesMap.set(size.size, size);
      });

      const updatedSizes = DEFAULT_PRODUCT_SIZES.map(size => {
        const existingSize = sizesMap.get(size);
        if (existingSize) {
          return {
            ...existingSize,
            quantity: existingSize.quantity ?? 0,
            inStock: (existingSize.quantity ?? 0) > 0,
          };
        }
        return {
          size,
          inStock: false,
          quantity: 0,
        };
      });
      setSizes(updatedSizes);
    }
  }, [initialSizes, isOpen]);

  // Subscribe to online/offline status
  useEffect(() => {
    const unsubscribe = offlineSyncService.onStatusChange((online) => {
      setIsOnline(online);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleUpdate = () => {
    // Update inStock based on quantity
    const updatedSizes: ProductSize[] = sizes.map(size => ({
      ...size,
      inStock: (size.quantity || 0) > 0,
      quantity: size.quantity || 0,
    }));
    onUpdate(productId, updatedSizes);
    onClose();
  };

  const handleReset = () => {
    // Reset to initial sizes, ensuring all default sizes are present
    const sizesMap = new Map<string, ProductSize>();
    initialSizes.forEach(size => {
      sizesMap.set(size.size, size);
    });

    const resetSizes = DEFAULT_PRODUCT_SIZES.map(size => {
      const existingSize = sizesMap.get(size);
      if (existingSize) {
        return {
          ...existingSize,
          quantity: existingSize.quantity ?? 0,
          inStock: (existingSize.quantity ?? 0) > 0,
        };
      }
      return {
        size,
        inStock: false,
        quantity: 0,
      };
    });
    setSizes(resetSizes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="admin-modal bg-white rounded-lg p-[var(--admin-space-4)] sm:p-[var(--admin-space-5)] lg:p-[var(--admin-space-6)] max-w-2xl w-full mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold truncate">Update Stock - {productName}</h2>
            {!isOnline && (
              <div className="flex items-center gap-1 text-orange-600 text-xs sm:text-sm mt-1">
                <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-words">Offline - Changes will be saved locally and synced later</span>
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors self-end sm:self-auto"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {sizes.map((size, index) => (
            <div key={size.size} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <label className="w-full sm:w-24 font-medium text-gray-700 text-sm sm:text-base">Size {size.size}:</label>
              <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <input
                  type="number"
                  min="0"
                  value={size.quantity || 0}
                  onChange={(e) => {
                    const newSizes: ProductSize[] = [...sizes];
                    newSizes[index] = {
                      ...newSizes[index],
                      quantity: Math.max(0, parseInt(e.target.value) || 0),
                      inStock: Math.max(0, parseInt(e.target.value) || 0) > 0,
                    };
                    setSizes(newSizes);
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      const newSizes: ProductSize[] = [...sizes];
                      newSizes[index] = {
                        ...newSizes[index],
                        quantity: (newSizes[index].quantity || 0) + 5,
                        inStock: true,
                      };
                      setSizes(newSizes);
                    }}
                    className="px-2 sm:px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
                  >
                    +5
                  </button>
                  <button
                    onClick={() => {
                      const newSizes: ProductSize[] = [...sizes];
                      newSizes[index] = {
                        ...newSizes[index],
                        quantity: (newSizes[index].quantity || 0) + 10,
                        inStock: true,
                      };
                      setSizes(newSizes);
                    }}
                    className="px-2 sm:px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
                  >
                    +10
                  </button>
                </div>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  (size.quantity || 0) === 0 
                    ? 'bg-red-500' 
                    : (size.quantity || 0) < 5 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`} title={(size.quantity || 0) === 0 ? 'Out of Stock' : (size.quantity || 0) < 5 ? 'Low Stock' : 'In Stock'} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="flex-1 order-2 sm:order-1"
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 order-3 sm:order-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            className="flex-1 bg-black text-white hover:bg-gray-800 order-1 sm:order-3"
          >
            Update Stock
          </Button>
        </div>
      </div>
    </div>
  );
}
