/**
 * Complete Look Mock Data
 * 
 * Curated complete looks with multiple products
 */

import type { CompleteLook } from "@/types";
import { mockProducts } from "../mock-data";

export const completeLooks: CompleteLook[] = [
  {
    id: 'smart-casual-gentleman',
    name: 'Smart Casual Gentleman',
    slug: 'smart-casual-gentleman',
    description: 'Refined style for the modern young man. Perfect for special occasions, family gatherings, or any time he wants to look his best. This complete look combines sophisticated pieces that work together seamlessly.',
    mainImage: '/Complete Set.jpg',
    items: [
      {
        productId: 'blue-patterned-shirt',
        product: {
          id: 'blue-patterned-shirt',
          name: 'Blue Patterned Camp Collar Shirt',
          description: 'Premium cotton shirt with distinctive geometric pattern. Camp collar for relaxed sophistication. Perfect for smart-casual occasions.',
          price: 25000, // 250 GHS in pesewas
          images: [{ url: '/Blue Patterned Short-Sleeve Shirt.jpg', isPrimary: true, alt: 'Blue Patterned Camp Collar Shirt' }],
          category: {
            id: 'cat-boys',
            name: 'Boys',
            slug: 'boys',
          },
          sizes: [
            { size: '4', inStock: true, quantity: 10 },
            { size: '6', inStock: true, quantity: 15 },
            { size: '8', inStock: true, quantity: 12 },
            { size: '10', inStock: true, quantity: 8 },
            { size: '12', inStock: true, quantity: 5 },
          ],
          slug: 'blue-patterned-camp-collar-shirt',
          inStock: true,
          tags: ['boys', 'shirt', 'smart-casual', 'patterned'],
          sku: 'BPC-001',
        },
        required: true,
      },
      {
        productId: 'navy-tailored-trousers',
        product: {
          id: 'navy-tailored-trousers',
          name: 'Navy Tailored Dress Trousers',
          description: 'Perfectly tailored trousers in premium navy fabric. Front pleat details and comfortable fit. Essential smart-casual piece.',
          price: 25000, // 250 GHS in pesewas
          images: [{ url: '/Navy Tailored Trousers.jpg', isPrimary: true, alt: 'Navy Tailored Dress Trousers' }],
          category: {
            id: 'cat-boys',
            name: 'Boys',
            slug: 'boys',
          },
          sizes: [
            { size: '4', inStock: true, quantity: 8 },
            { size: '6', inStock: true, quantity: 12 },
            { size: '8', inStock: true, quantity: 15 },
            { size: '10', inStock: true, quantity: 10 },
            { size: '12', inStock: true, quantity: 6 },
          ],
          slug: 'navy-tailored-dress-trousers',
          inStock: true,
          tags: ['boys', 'trousers', 'smart', 'navy'],
          sku: 'NTD-001',
        },
        required: true,
      },
      {
        productId: 'burgundy-suede-loafers',
        product: {
          id: 'burgundy-suede-loafers',
          name: 'Burgundy Suede Loafers',
          description: 'Premium suede loafers with contrast sole. Slip-on design for easy wear. Sophisticated finish for any refined look.',
          price: 45000, // 450 GHS in pesewas
          images: [{ url: '/Burgundy Suede Loafers.jpg', isPrimary: true, alt: 'Burgundy Suede Loafers' }],
          category: {
            id: 'cat-accessories',
            name: 'Accessories',
            slug: 'accessories',
          },
          sizes: [
            { size: '11', inStock: true, quantity: 5 },
            { size: '12', inStock: true, quantity: 8 },
            { size: '13', inStock: true, quantity: 6 },
            { size: '1', inStock: true, quantity: 4 },
            { size: '2', inStock: true, quantity: 3 },
            { size: '3', inStock: true, quantity: 2 },
          ],
          slug: 'burgundy-suede-loafers',
          inStock: true,
          tags: ['boys', 'loafers', 'suede', 'burgundy'],
          sku: 'BSL-001',
        },
        required: true,
      },
    ],
    totalPrice: 95000, // 950 GHS in pesewas
    bundlePrice: 90000, // 900 GHS in pesewas (50 GHS savings)
    savings: 5000, // 50 GHS in pesewas
    featured: true,
    tags: ['boys', 'smart-casual', 'complete-look', 'gentleman'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
