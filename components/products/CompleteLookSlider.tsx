'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/stores/cart-store';
import type { CompleteLook } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CompleteLookSliderProps {
  look: CompleteLook;
}

export function CompleteLookSlider({ look }: CompleteLookSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(look.items.map(item => item.productId))
  );
  
  const addToCart = useCartStore((state) => state.addItem);

  type SlideItem = 
    | { type: 'complete'; image: string; title: string; price: number; originalPrice: number; savings: number }
    | { type: 'individual'; id: string; image: string; title: string; price: number; product: any };

  const items: SlideItem[] = [
    // First slide: Complete look
    {
      type: 'complete',
      image: look.mainImage,
      title: look.name,
      price: look.bundlePrice,
      originalPrice: look.totalPrice,
      savings: look.savings,
    },
    // Individual items
    ...look.items.map(item => ({
      type: 'individual' as const,
      id: item.productId,
      image: item.product.images[0]?.url || '/placeholder.jpg',
      title: item.product.name,
      price: item.product.price,
      product: item.product,
    })),
  ];

  const handleAddCompleteLook = () => {
    look.items.forEach(item => {
      // Find first available size
      const availableSize = item.product.sizes.find(s => s.inStock)?.size || item.product.sizes[0]?.size || '8';
      addToCart(item.product, availableSize);
    });
    // Show success message (you can replace with toast)
    alert('Complete look added to cart!');
  };

  const handleAddIndividualItem = (item: any) => {
    const availableSize = item.product.sizes.find((s: any) => s.inStock)?.size || item.product.sizes[0]?.size || '8';
    addToCart(item.product, availableSize);
    alert(`${item.title} added to cart!`);
  };

  const toggleItemSelection = (productId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedItems(newSelection);
  };

  const calculateSelectedTotal = () => {
    return look.items
      .filter(item => selectedItems.has(item.productId))
      .reduce((sum, item) => sum + item.product.price, 0);
  };

  const handleAddSelected = () => {
    look.items
      .filter(item => selectedItems.has(item.productId))
      .forEach(item => {
        const availableSize = item.product.sizes.find(s => s.inStock)?.size || item.product.sizes[0]?.size || '8';
        addToCart(item.product, availableSize);
      });
    alert('Selected items added to cart!');
  };

  const formatPrice = (price: number) => {
    // Convert from pesewas to GHS
    return (price / 100).toFixed(0);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Main Slider */}
      <div className="relative w-full mb-6 overflow-hidden bg-gray-100 rounded-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="relative w-full"
          >
            <div className="relative w-full flex items-center justify-center py-4" style={{ minHeight: '400px', maxHeight: '70vh' }}>
              <Image
                src={items[currentSlide].image}
                alt={items[currentSlide].title}
                width={1200}
                height={1500}
                className="object-contain w-auto h-auto max-w-full max-h-[70vh]"
                priority={currentSlide === 0}
                style={{ maxWidth: '100%', maxHeight: '70vh', height: 'auto', width: 'auto' }}
              />
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white z-10 pointer-events-none">
              <div className="max-w-4xl mx-auto">
                {items[currentSlide].type === 'complete' ? (
                  <>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                      {items[currentSlide].title}
                    </h2>
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <span className="text-2xl font-bold">
                        {formatPrice(items[currentSlide].price)} GHS
                      </span>
                      <span className="text-lg line-through text-white/60">
                        {formatPrice(items[currentSlide].originalPrice!)} GHS
                      </span>
                      <span className="px-3 py-1 bg-green-500 text-sm font-semibold rounded-full">
                        Save {formatPrice(items[currentSlide].savings)} GHS
                      </span>
                    </div>
                    <button
                      onClick={handleAddCompleteLook}
                      className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors pointer-events-auto"
                    >
                      Add Complete Look to Cart
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                      {items[currentSlide].title}
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-2xl font-bold">
                        {formatPrice(items[currentSlide].price)} GHS
                      </span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <button
                        onClick={() => handleAddIndividualItem(items[currentSlide])}
                        className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors pointer-events-auto"
                      >
                        Add to Cart
                      </button>
                      {items[currentSlide].type === 'individual' && (() => {
                        const item = items[currentSlide];
                        if (item.type === 'individual') {
                          return (
                            <button
                              onClick={() => toggleItemSelection(item.id)}
                              className={`px-8 py-3 font-semibold rounded-lg transition-colors pointer-events-auto ${
                                selectedItems.has(item.id)
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white/20 text-white border border-white'
                              }`}
                            >
                              {selectedItems.has(item.id) ? '✓ Selected' : 'Select'}
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {currentSlide > 0 && (
          <button
            onClick={() => setCurrentSlide(currentSlide - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {currentSlide < items.length - 1 && (
          <button
            onClick={() => setCurrentSlide(currentSlide + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Slide Indicator */}
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10">
          {currentSlide + 1} / {items.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden transition-all ${
              currentSlide === index
                ? 'ring-4 ring-black scale-105'
                : 'ring-1 ring-gray-300 opacity-60 hover:opacity-100'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
            {index === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-white text-xs font-semibold">Complete</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected Items Summary */}
      {selectedItems.size > 0 && selectedItems.size < look.items.length && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-lg font-semibold">Selected Items</h4>
              <p className="text-sm text-gray-600">
                {selectedItems.size} of {look.items.length} items selected
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{formatPrice(calculateSelectedTotal())} GHS</span>
            </div>
          </div>
          <button
            onClick={handleAddSelected}
            className="w-full px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add Selected Items to Cart
          </button>
        </div>
      )}

      {/* Product Details Grid */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {look.items.map((item) => (
          <div key={item.productId} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={item.product.images[0]?.url || '/placeholder.jpg'}
                alt={item.product.name}
                fill
                className="object-contain"
              />
            </div>
            <h4 className="font-semibold mb-2">{item.product.name}</h4>
            <p className="text-lg font-bold mb-3">{formatPrice(item.product.price)} GHS</p>
            <button
              onClick={() => {
                const availableSize = item.product.sizes.find(s => s.inStock)?.size || item.product.sizes[0]?.size || '8';
                addToCart(item.product, availableSize);
                alert(`${item.product.name} added to cart!`);
              }}
              className="w-full px-4 py-2 border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
