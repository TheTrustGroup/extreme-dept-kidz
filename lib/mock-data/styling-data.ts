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
    mainImage: "/4671.png",
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
    mainImage: "/4672.png",
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
    mainImage: "/4674.png",
    products: [
      { productId: "prod-6", category: "top" }, // Premium Polo Shirt
      { productId: "prod-9", category: "bottom" }, // Cargo Shorts
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
    ],
    totalPrice: 17500, // $175.00
    bundleDiscount: 10,
    createdAt: new Date("2024-02-01"),
    featured: true,
  },
  {
    id: "look-4",
    name: "School Day Classic",
    description: "Polished and put-together for school days. Timeless pieces that look great every day.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "6-10",
    mainImage: "/4675.png",
    products: [
      { productId: "prod-2", category: "top" }, // Premium Cotton Tee
      { productId: "prod-3", category: "bottom" }, // Classic Chino Pants
      { productId: "prod-8", category: "outerwear" }, // Wool Blend Cardigan
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
    ],
    totalPrice: 33700, // $337.00
    bundleDiscount: 10,
    createdAt: new Date("2024-02-10"),
    featured: false,
  },
  {
    id: "look-5",
    name: "Adventure Seeker",
    description: "Ready for any adventure. Durable, comfortable pieces that move with active kids.",
    occasion: "Active",
    season: "fall",
    ageRange: "5-9",
    mainImage: "/4676.png",
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
    mainImage: "/4677.png",
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
    mainImage: "/4678.png",
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
    mainImage: "/4679.png",
    products: [
      { productId: "prod-6", category: "top" }, // Premium Polo Shirt
      { productId: "prod-3", category: "bottom" }, // Classic Chino Pants
      { productId: "prod-8", category: "outerwear" }, // Wool Blend Cardigan
      { productId: "prod-7", category: "shoes" }, // Canvas Sneakers
    ],
    totalPrice: 36000, // $360.00
    bundleDiscount: 10,
    createdAt: new Date("2024-03-05"),
    featured: false,
  },
  {
    id: "look-9",
    name: "Street Style",
    description: "Urban cool meets everyday comfort. Perfect for city adventures.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "6-10",
    mainImage: "/4680.png",
    products: [
      { productId: "prod-1", category: "outerwear" },
      { productId: "prod-2", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 30700,
    bundleDiscount: 10,
    createdAt: new Date("2024-03-10"),
    featured: false,
  },
  {
    id: "look-10",
    name: "Active Adventure",
    description: "Built for movement and style. Perfect for active kids who love to explore.",
    occasion: "Active",
    season: "all-season",
    ageRange: "5-9",
    mainImage: "/4681.png",
    products: [
      { productId: "prod-4", category: "top" },
      { productId: "prod-5", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 20500,
    bundleDiscount: 10,
    createdAt: new Date("2024-03-15"),
    featured: false,
  },
  {
    id: "look-11",
    name: "Casual Cool",
    description: "Effortless style for everyday moments. Comfortable and confident.",
    occasion: "Everyday",
    season: "summer",
    ageRange: "7-12",
    mainImage: "/4682.png",
    products: [
      { productId: "prod-2", category: "top" },
      { productId: "prod-9", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 17500,
    bundleDiscount: 10,
    createdAt: new Date("2024-03-20"),
    featured: false,
  },
  {
    id: "look-12",
    name: "Classic Collection",
    description: "Timeless pieces that never go out of style. Perfect for any occasion.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "6-10",
    mainImage: "/4683.png",
    products: [
      { productId: "prod-2", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-8", category: "outerwear" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 33700,
    bundleDiscount: 10,
    createdAt: new Date("2024-03-25"),
    featured: false,
  },
  {
    id: "look-13",
    name: "Weekend Warrior",
    description: "Ready for weekend fun. Comfortable and stylish for all activities.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "5-9",
    mainImage: "/4684.png",
    products: [
      { productId: "prod-4", category: "top" },
      { productId: "prod-9", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 17500,
    bundleDiscount: 10,
    createdAt: new Date("2024-04-01"),
    featured: false,
  },
  {
    id: "look-14",
    name: "Modern Classic",
    description: "Contemporary style with classic appeal. Perfect for the modern boy.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "7-12",
    mainImage: "/4685.png",
    products: [
      { productId: "prod-6", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 20500,
    bundleDiscount: 10,
    createdAt: new Date("2024-04-05"),
    featured: false,
  },
  {
    id: "look-15",
    name: "Urban Explorer",
    description: "City-ready style for young adventurers. Bold and confident.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "6-10",
    mainImage: "/4686.png",
    products: [
      { productId: "prod-1", category: "outerwear" },
      { productId: "prod-2", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 30700,
    bundleDiscount: 10,
    createdAt: new Date("2024-04-10"),
    featured: false,
  },
  {
    id: "look-16",
    name: "Active Lifestyle",
    description: "Designed for active kids who love to move. Comfort meets performance.",
    occasion: "Active",
    season: "all-season",
    ageRange: "4-8",
    mainImage: "/4687.png",
    products: [
      { productId: "prod-4", category: "top" },
      { productId: "prod-5", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 20500,
    bundleDiscount: 10,
    createdAt: new Date("2024-04-15"),
    featured: false,
  },
  {
    id: "look-17",
    name: "Layered Style",
    description: "Versatile layering for changing seasons. Style that adapts.",
    occasion: "Everyday",
    season: "fall",
    ageRange: "6-12",
    mainImage: "/4688.png",
    products: [
      { productId: "prod-2", category: "top" },
      { productId: "prod-8", category: "outerwear" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 33700,
    bundleDiscount: 10,
    createdAt: new Date("2024-04-20"),
    featured: false,
  },
  {
    id: "look-18",
    name: "Sporty Casual",
    description: "Athletic style meets everyday comfort. Perfect for active days.",
    occasion: "Active",
    season: "all-season",
    ageRange: "5-9",
    mainImage: "/4690.png",
    products: [
      { productId: "prod-4", category: "top" },
      { productId: "prod-5", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 20500,
    bundleDiscount: 10,
    createdAt: new Date("2024-04-25"),
    featured: false,
  },
  {
    id: "look-19",
    name: "Everyday Essentials",
    description: "The perfect everyday look. Comfortable, stylish, and versatile.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "6-10",
    mainImage: "/4691.png",
    products: [
      { productId: "prod-2", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 17500,
    bundleDiscount: 10,
    createdAt: new Date("2024-05-01"),
    featured: false,
  },
  {
    id: "look-20",
    name: "Street Smart",
    description: "Urban style with a modern edge. Perfect for city kids.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "7-12",
    mainImage: "/4692.png",
    products: [
      { productId: "prod-1", category: "outerwear" },
      { productId: "prod-2", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 30700,
    bundleDiscount: 10,
    createdAt: new Date("2024-05-05"),
    featured: false,
  },
  {
    id: "look-21",
    name: "Playground Ready",
    description: "Built for fun and adventure. Comfortable activewear for active kids.",
    occasion: "Active",
    season: "spring",
    ageRange: "4-8",
    mainImage: "/4693.png",
    products: [
      { productId: "prod-4", category: "top" },
      { productId: "prod-5", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 20500,
    bundleDiscount: 10,
    createdAt: new Date("2024-05-10"),
    featured: false,
  },
  {
    id: "look-22",
    name: "Weekend Vibes",
    description: "Relaxed weekend style. Comfortable and cool for downtime.",
    occasion: "Everyday",
    season: "summer",
    ageRange: "7-12",
    mainImage: "/4694.png",
    products: [
      { productId: "prod-6", category: "top" },
      { productId: "prod-9", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 17500,
    bundleDiscount: 10,
    createdAt: new Date("2024-05-15"),
    featured: false,
  },
  {
    id: "look-23",
    name: "Classic Comfort",
    description: "Timeless style with modern comfort. Perfect for any day.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "6-10",
    mainImage: "/4695.png",
    products: [
      { productId: "prod-2", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-8", category: "outerwear" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 33700,
    bundleDiscount: 10,
    createdAt: new Date("2024-05-20"),
    featured: false,
  },
  {
    id: "look-24",
    name: "Active Explorer",
    description: "Ready for adventure. Durable and stylish for active exploration.",
    occasion: "Active",
    season: "all-season",
    ageRange: "5-9",
    mainImage: "/4696.png",
    products: [
      { productId: "prod-4", category: "top" },
      { productId: "prod-9", category: "bottom" },
      { productId: "prod-1", category: "outerwear" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 39700,
    bundleDiscount: 10,
    createdAt: new Date("2024-05-25"),
    featured: false,
  },
  {
    id: "look-25",
    name: "Modern Street",
    description: "Contemporary street style. Bold and confident for the modern boy.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "7-12",
    mainImage: "/4697.png",
    products: [
      { productId: "prod-1", category: "outerwear" },
      { productId: "prod-2", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 30700,
    bundleDiscount: 10,
    createdAt: new Date("2024-06-01"),
    featured: false,
  },
  {
    id: "look-26",
    name: "Sporty Classic",
    description: "Athletic style with classic appeal. Perfect for active and casual moments.",
    occasion: "Active",
    season: "all-season",
    ageRange: "4-8",
    mainImage: "/4698.png",
    products: [
      { productId: "prod-4", category: "top" },
      { productId: "prod-5", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 20500,
    bundleDiscount: 10,
    createdAt: new Date("2024-06-05"),
    featured: false,
  },
  {
    id: "look-27",
    name: "Casual Explorer",
    description: "Comfortable exploration style. Perfect for everyday adventures.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "6-10",
    mainImage: "/IMG_4673.png",
    products: [
      { productId: "prod-2", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 17500,
    bundleDiscount: 10,
    createdAt: new Date("2024-06-10"),
    featured: false,
  },
  {
    id: "look-28",
    name: "Urban Classic",
    description: "City style with timeless appeal. Perfect for urban adventures.",
    occasion: "Everyday",
    season: "all-season",
    ageRange: "7-12",
    mainImage: "/IMG_4689.png",
    products: [
      { productId: "prod-6", category: "top" },
      { productId: "prod-3", category: "bottom" },
      { productId: "prod-8", category: "outerwear" },
      { productId: "prod-7", category: "shoes" },
    ],
    totalPrice: 36000,
    bundleDiscount: 10,
    createdAt: new Date("2024-06-15"),
    featured: false,
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
