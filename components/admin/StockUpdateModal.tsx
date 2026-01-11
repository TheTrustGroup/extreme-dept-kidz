'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductSize {
  size: string;
  quantity: number;
  inStock: boolean;
}

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
  const [sizes, setSizes] = useState<ProductSize[]>(initialSizes);

  if (!isOpen) return null;

  const handleUpdate = () => {
    // Update inStock based on quantity
    const updatedSizes = sizes.map(size => ({
      ...size,
      inStock: size.quantity > 0,
    }));
    onUpdate(productId, updatedSizes);
    onClose();
  };

  const handleReset = () => {
    setSizes(initialSizes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Update Stock - {productName}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {sizes.map((size, index) => (
            <div key={size.size} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <label className="w-24 font-medium text-gray-700">Size {size.size}:</label>
              <input
                type="number"
                min="0"
                value={size.quantity}
                onChange={(e) => {
                  const newSizes = [...sizes];
                  newSizes[index].quantity = Math.max(0, parseInt(e.target.value) || 0);
                  setSizes(newSizes);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newSizes = [...sizes];
                    newSizes[index].quantity += 5;
                    setSizes(newSizes);
                  }}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  +5
                </button>
                <button
                  onClick={() => {
                    const newSizes = [...sizes];
                    newSizes[index].quantity += 10;
                    setSizes(newSizes);
                  }}
                  className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  +10
                </button>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                size.quantity === 0 
                  ? 'bg-red-500' 
                  : size.quantity < 5 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
              }`} title={size.quantity === 0 ? 'Out of Stock' : size.quantity < 5 ? 'Low Stock' : 'In Stock'} />
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            className="flex-1 bg-black text-white hover:bg-gray-800"
          >
            Update Stock
          </Button>
        </div>
      </div>
    </div>
  );
}
