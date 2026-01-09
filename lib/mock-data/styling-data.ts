/**
 * Styling Mock Data
 * 
 * Complete looks and product styling data for "Complete The Look" feature.
 */

import type { StyleLook, ProductStyling } from "@/types/styling";

export const styleLooks: StyleLook[] = [
  {
    id: "look-1",
    name: "Urban Explorer",
    description: "Street-ready style for the adventurous boy. Perfect for weekend adventures and casual outings.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "6-10",
    mainImage: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2070&auto=format&fit=crop",
    products: [
      { productId: "prod-1", category: "outerwear" }, // Heritage Denim Jacket
      { productId: "prod-2", category: "top" }, // Premium Cotton Tee
      { productId: "prod-3", category: "bottom" }, // Classic Chino Pants
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
    ],
    totalPrice: 30700, // $307.00
    bundleDiscount: 10, // 10% off
    createdAt: new Date("2024-01-15"),
    featured: true,
  },
  {
    id: "look-2",
    name: "Playground Ready",
    description: "Comfortable activewear that keeps up with non-stop energy. Built for play, styled for confidence.",
    occasion: "Active",
    season: "spring",
    ageRange: "4-8",
    mainImage: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2087&auto=format&fit=crop",
    products: [
      { productId: "prod-4", category: "top" }, // Urban Hoodie
      { productId: "prod-5", category: "bottom" }, // Athletic Joggers
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
      { productId: "prod-10", category: "accessories", isOptional: true }, // Leather Backpack
    ],
    totalPrice: 26500, // $265.00
    bundleDiscount: 10,
    createdAt: new Date("2024-01-20"),
    featured: true,
  },
  {
    id: "look-3",
    name: "Weekend Casual",
    description: "Effortlessly cool style for relaxed weekends. Comfortable meets confident.",
    occasion: "Everyday",
    season: "summer",
    ageRange: "7-12",
    mainImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2087&auto=format&fit=crop",
    products: [
      { productId: "prod-6", category: "top" }, // Premium Polo Shirt
      { productId: "prod-9", category: "bottom" }, // Cargo Shorts
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
    ],
    totalPrice: 17500, // $175.00
    bundleDiscount: 10,
    createdAt: new Date("2024-02-01"),
    featured: false,
  },
  {
    id: "look-4",
    name: "School Day Classic",
    description: "Polished and put-together for school days. Timeless pieces that look great every day.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "6-10",
    mainImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
    products: [
      { productId: "prod-2", category: "top" }, // Premium Cotton Tee
      { productId: "prod-3", category: "bottom" }, // Classic Chino Pants
      { productId: "prod-8", category: "outerwear" }, // Wool Blend Cardigan
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
    ],
    totalPrice: 33700, // $337.00
    bundleDiscount: 10,
    createdAt: new Date("2024-02-10"),
    featured: true,
  },
  {
    id: "look-5",
    name: "Adventure Seeker",
    description: "Ready for any adventure. Durable, comfortable pieces that move with active kids.",
    occasion: "Active",
    season: "fall",
    ageRange: "5-9",
    mainImage: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2070&auto=format&fit=crop",
    products: [
      { productId: "prod-4", category: "top" }, // Urban Hoodie
      { productId: "prod-9", category: "bottom" }, // Cargo Shorts
      { productId: "prod-1", category: "outerwear" }, // Heritage Denim Jacket
      { productId: "prod-10", category: "accessories", isOptional: true }, // Leather Backpack
    ],
    totalPrice: 39700, // $397.00
    bundleDiscount: 10,
    createdAt: new Date("2024-02-15"),
    featured: false,
  },
  {
    id: "look-6",
    name: "Layered Comfort",
    description: "Perfect for changing weather. Layer up or down with versatile pieces.",
    occasion: "Everyday",
    season: "fall",
    ageRange: "6-12",
    mainImage: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2064&auto=format&fit=crop",
    products: [
      { productId: "prod-2", category: "top" }, // Premium Cotton Tee
      { productId: "prod-8", category: "outerwear" }, // Wool Blend Cardigan
      { productId: "prod-3", category: "bottom" }, // Classic Chino Pants
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
    ],
    totalPrice: 33700, // $337.00
    bundleDiscount: 10,
    createdAt: new Date("2024-02-20"),
    featured: false,
  },
  {
    id: "look-7",
    name: "Sporty Style",
    description: "Active lifestyle meets street style. Comfortable pieces that look great on and off the field.",
    occasion: "Active",
    season: "all-season",
    ageRange: "4-8",
    mainImage: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2087&auto=format&fit=crop",
    products: [
      { productId: "prod-4", category: "top" }, // Urban Hoodie
      { productId: "prod-5", category: "bottom" }, // Athletic Joggers
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
    ],
    totalPrice: 20500, // $205.00
    bundleDiscount: 10,
    createdAt: new Date("2024-03-01"),
    featured: false,
  },
  {
    id: "look-8",
    name: "Smart Casual",
    description: "Elevated everyday style. Perfect for family gatherings and special occasions.",
    occasion: "Special Occasion",
    season: "all-season",
    ageRange: "7-12",
    mainImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2087&auto=format&fit=crop",
    products: [
      { productId: "prod-6", category: "top" }, // Premium Polo Shirt
      { productId: "prod-3", category: "bottom" }, // Classic Chino Pants
      { productId: "prod-8", category: "outerwear" }, // Wool Blend Cardigan
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
    ],
    totalPrice: 36000, // $360.00
    bundleDiscount: 10,
    createdAt: new Date("2024-03-05"),
    featured: true,
  },
];

export const productStylingData: Record<string, ProductStyling> = {
  "prod-1": {
    productId: "prod-1",
    completeTheLook: [
      { lookId: "look-1" },
      { lookId: "look-5" },
    ],
    frequentlyBoughtWith: ["prod-2", "prod-3", "prod-7"],
    styleNotes: "Layer over tees or hoodies for versatile street style",
  },
  "prod-2": {
    productId: "prod-2",
    completeTheLook: [
      { 
        lookId: "look-1",
        alternativeProducts: [
          { category: "bottom", productIds: ["prod-9", "prod-5"] },
          { category: "outerwear", productIds: ["prod-8", "prod-4"] },
        ],
      },
      { lookId: "look-4" },
      { lookId: "look-6" },
    ],
    frequentlyBoughtWith: ["prod-3", "prod-9", "prod-7"],
    styleNotes: "Essential basic that pairs with everything",
  },
  "prod-3": {
    productId: "prod-3",
    completeTheLook: [
      { lookId: "look-1" },
      { lookId: "look-4" },
      { lookId: "look-6" },
      { lookId: "look-8" },
    ],
    frequentlyBoughtWith: ["prod-2", "prod-6", "prod-7"],
    styleNotes: "Versatile chinos that work for school and weekends",
  },
  "prod-4": {
    productId: "prod-4",
    completeTheLook: [
      { lookId: "look-2" },
      { lookId: "look-5" },
      { lookId: "look-7" },
    ],
    frequentlyBoughtWith: ["prod-5", "prod-7", "prod-9"],
    styleNotes: "Perfect for active days and casual weekends",
  },
  "prod-5": {
    productId: "prod-5",
    completeTheLook: [
      { lookId: "look-2" },
      { lookId: "look-7" },
    ],
    frequentlyBoughtWith: ["prod-4", "prod-7", "prod-2"],
    styleNotes: "Comfortable joggers for play and everyday wear",
  },
  "prod-6": {
    productId: "prod-6",
    completeTheLook: [
      { lookId: "look-3" },
      { lookId: "look-8" },
    ],
    frequentlyBoughtWith: ["prod-3", "prod-9", "prod-7"],
    styleNotes: "Classic polo perfect for smart casual occasions",
  },
  "prod-7": {
    productId: "prod-7",
    completeTheLook: [
      { lookId: "look-1" },
      { lookId: "look-2" },
      { lookId: "look-3" },
      { lookId: "look-4" },
      { lookId: "look-6" },
      { lookId: "look-7" },
      { lookId: "look-8" },
    ],
    frequentlyBoughtWith: ["prod-2", "prod-3", "prod-4"],
    styleNotes: "Versatile sneakers that complete any look",
  },
  "prod-8": {
    productId: "prod-8",
    completeTheLook: [
      { lookId: "look-4" },
      { lookId: "look-6" },
      { lookId: "look-8" },
    ],
    frequentlyBoughtWith: ["prod-2", "prod-3", "prod-6"],
    styleNotes: "Perfect layering piece for cooler weather",
  },
  "prod-9": {
    productId: "prod-9",
    completeTheLook: [
      { lookId: "look-3" },
      { lookId: "look-5" },
    ],
    frequentlyBoughtWith: ["prod-2", "prod-4", "prod-6"],
    styleNotes: "Functional shorts for warm weather adventures",
  },
  "prod-10": {
    productId: "prod-10",
    completeTheLook: [
      { lookId: "look-2" },
      { lookId: "look-5" },
    ],
    frequentlyBoughtWith: ["prod-4", "prod-5", "prod-7"],
    styleNotes: "Stylish backpack perfect for school and adventures",
  },
};
