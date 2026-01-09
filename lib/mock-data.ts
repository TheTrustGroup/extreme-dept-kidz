/**
 * Mock Data
 * 
 * Realistic mock data for development and testing.
 * All data is typed using the application's type definitions.
 */

import type {
  Product,
  Collection,
  Category,
  ProductImage,
  ProductSize,
} from "@/types";

// Re-export styling data
export { styleLooks, productStylingData } from "./mock-data/styling-data";

/**
 * Mock Categories
 */
export const mockCategories: Category[] = [
  {
    id: "cat-boys",
    name: "Boys",
    slug: "boys",
    description: "Premium fashion for boys",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=2086&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "cat-girls",
    name: "Girls",
    slug: "girls",
    description: "Luxury fashion for girls",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Premium accessories and essentials",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "cat-new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "Latest additions to our collection",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    isActive: true,
  },
];

/**
 * Mock Collections
 */
export const mockCollections: Collection[] = [
  {
    id: "coll-new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "Discover our latest premium pieces",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "coll-street-essentials",
    name: "Street Essentials",
    slug: "street-essentials",
    description: "Urban-inspired streetwear for modern kids",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1926&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "coll-premium-basics",
    name: "Premium Basics",
    slug: "premium-basics",
    description: "Timeless essentials crafted with premium materials",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070&auto=format&fit=crop",
    isActive: true,
  },
];

/**
 * Helper function to generate product sizes
 */
function generateSizes(availableSizes: string[]): ProductSize[] {
  const allSizes = ["2T", "3T", "4T", "5T", "6", "8", "10", "12"];
  return allSizes.map((size) => ({
    size,
    inStock: availableSizes.includes(size),
  }));
}

/**
 * Helper function to generate product images
 */
function generateImages(
  primaryUrl: string,
  secondaryUrl?: string,
  tertiaryUrl?: string
): ProductImage[] {
  const images: ProductImage[] = [
    { url: primaryUrl, isPrimary: true, alt: "Product primary image" },
  ];
  if (secondaryUrl) {
    images.push({ url: secondaryUrl, alt: "Product secondary image" });
  }
  if (tertiaryUrl) {
    images.push({ url: tertiaryUrl, alt: "Product detail image" });
  }
  return images;
}

/**
 * Mock Products
 * 20 premium kids fashion products
 */
export const mockProducts: Product[] = [
  // Boys Products
  {
    id: "prod-1",
    name: "Heritage Denim Jacket",
    description:
      "A timeless statement piece crafted from premium Japanese selvedge denim. Meticulously constructed with vintage-inspired hardware and a thoughtfully designed relaxed fit. Built to become a cherished wardrobe essential that ages beautifully with every adventure.",
    price: 12900, // $129.00
    images: generateImages(
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "heritage-denim-jacket",
    inStock: true,
    tags: ["new", "bestseller"],
    sku: "HDJ-001",
  },
  {
    id: "prod-2",
    name: "Premium Cotton Tee",
    description:
      "The foundation of effortless style. Crafted from ultra-soft organic cotton with a refined relaxed fit. Designed to layer beautifully or stand alone, this essential piece elevates everyday moments. Available in carefully curated colorways.",
    price: 4500, // $45.00
    images: generateImages(
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop"
    ),
    sizes: generateSizes(["2T", "3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "premium-cotton-tee",
    inStock: true,
    tags: ["bestseller"],
    sku: "PCT-001",
  },
  {
    id: "prod-3",
    name: "Classic Chino Pants",
    description:
      "Sophisticated tailoring meets everyday versatility. These premium cotton twill chinos feature a refined modern silhouette with an adjustable waistband, ensuring impeccable fit and lasting comfort. The perfect balance of polish and play.",
    price: 6800, // $68.00
    images: generateImages(
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2087&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2087&auto=format&fit=crop"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "classic-chino-pants",
    inStock: true,
    sku: "CCP-001",
  },
  {
    id: "prod-4",
    name: "Urban Hoodie",
    description:
      "Effortless comfort meets contemporary style. This premium cotton-blend fleece hoodie offers a relaxed, confident fit with thoughtful details including an adjustable drawstring hood and signature kangaroo pocket. Designed for both comfort and style.",
    price: 8500, // $85.00
    images: generateImages(
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2087&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2087&auto=format&fit=crop"
    ),
    sizes: generateSizes(["3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "urban-hoodie",
    inStock: true,
    tags: ["new"],
    sku: "UH-001",
  },
  {
    id: "prod-5",
    name: "Athletic Joggers",
    description:
      "Performance-driven design that doesn&apos;t compromise on style. Engineered with advanced moisture-wicking fabric, these joggers feature an elastic waistband and refined tapered silhouette. Built for active moments while maintaining sophisticated appeal.",
    price: 5500, // $55.00
    images: generateImages(
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "athletic-joggers",
    inStock: true,
    sku: "AJ-001",
  },
  {
    id: "prod-6",
    name: "Premium Polo Shirt",
    description:
      "A modern classic reimagined. Crafted from luxurious pima cotton with a refined collar and three-button placket, this polo embodies timeless elegance. The perfect intersection of casual sophistication and enduring style.",
    price: 5200, // $52.00
    images: generateImages(
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2087&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2087&auto=format&fit=crop"
    ),
    sizes: generateSizes(["2T", "3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "premium-polo-shirt",
    inStock: true,
    tags: ["bestseller"],
    sku: "PPS-001",
  },
  {
    id: "prod-7",
    name: "Canvas Sneakers",
    description:
      "Iconic design elevated through premium construction. These classic canvas sneakers combine exceptional comfort with enduring durability, creating a versatile foundation for any ensemble. Timeless style that stands the test of time.",
    price: 6500, // $65.00
    images: generateImages(
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "canvas-sneakers",
    inStock: true,
    tags: ["new"],
    sku: "CS-001",
  },
  {
    id: "prod-8",
    name: "Wool Blend Cardigan",
    description:
      "Luxurious warmth meets refined versatility. This sumptuous wool-blend cardigan is designed for effortless layering, offering exceptional softness and sophisticated style. A versatile essential that transitions seamlessly from casual to elevated occasions.",
    price: 9500, // $95.00
    images: generateImages(
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2064&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2064&auto=format&fit=crop"
    ),
    sizes: generateSizes(["3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "wool-blend-cardigan",
    inStock: true,
    sku: "WBC-001",
  },
  {
    id: "prod-9",
    name: "Cargo Shorts",
    description:
      "Functional design elevated through premium craftsmanship. These durable cotton twill cargo shorts feature thoughtfully placed pockets and an adjustable waistband. Where utility meets sophisticated style, perfect for adventures both big and small.",
    price: 5800, // $58.00
    images: generateImages(
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "cargo-shorts",
    inStock: true,
    sku: "CSH-001",
  },
  {
    id: "prod-10",
    name: "Leather Backpack",
    description:
      "A sophisticated companion for every adventure. Crafted from premium leather with adjustable straps, this backpack features a thoughtfully designed spacious main compartment and front pocket. Where functionality meets refined style, built to last through countless journeys.",
    price: 12500, // $125.00
    images: generateImages(
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "leather-backpack",
    inStock: true,
    tags: ["new"],
    sku: "LB-001",
  },
  // Girls Products
  {
    id: "prod-11",
    name: "Floral Print Dress",
    description:
      "Romantic elegance meets modern sophistication. This premium cotton floral print dress features a flattering A-line silhouette adorned with delicate, thoughtfully placed details. Designed to capture the essence of childhood wonder while maintaining refined style.",
    price: 7800, // $78.00
    images: generateImages(
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["2T", "3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[1], // Girls
    slug: "floral-print-dress",
    inStock: true,
    tags: ["new", "bestseller"],
    sku: "FPD-001",
  },
  {
    id: "prod-12",
    name: "Cashmere Sweater",
    description:
      "Indulgent luxury in its purest form. This sumptuous cashmere-blend sweater offers a relaxed, confident fit with exceptional softness and warmth. A timeless investment piece that elevates any ensemble while providing unmatched comfort.",
    price: 14500, // $145.00
    images: generateImages(
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2064&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2064&auto=format&fit=crop"
    ),
    sizes: generateSizes(["3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[1], // Girls
    slug: "cashmere-sweater",
    inStock: true,
    tags: ["bestseller"],
    sku: "CAS-001",
  },
  {
    id: "prod-13",
    name: "Denim Skirt",
    description:
      "A modern classic reimagined. This A-line denim skirt is crafted from premium denim fabric, offering a comfortable fit and timeless silhouette. Versatile enough for play, sophisticated enough for special moments.",
    price: 6200, // $62.00
    images: generateImages(
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[1], // Girls
    slug: "denim-skirt",
    inStock: true,
    sku: "DS-001",
  },
  {
    id: "prod-14",
    name: "Ribbed Knit Top",
    description:
      "Effortless sophistication in every detail. This soft ribbed knit top features a relaxed fit that moves beautifully. Exceptionally versatile and comfortable, designed to layer seamlessly or stand alone as a statement piece.",
    price: 4800, // $48.00
    images: generateImages(
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["2T", "3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[1], // Girls
    slug: "ribbed-knit-top",
    inStock: true,
    sku: "RKT-001",
  },
  {
    id: "prod-15",
    name: "Tulle Party Dress",
    description:
      "Where dreams meet design. This elegant tulle party dress features delicate, hand-placed details that capture the magic of special occasions. Meticulously crafted to create unforgettable moments, ensuring every celebration feels extraordinary.",
    price: 18000, // $180.00
    images: generateImages(
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["2T", "3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[1], // Girls
    slug: "tulle-party-dress",
    inStock: true,
    tags: ["new"],
    sku: "TPD-001",
  },
  {
    id: "prod-16",
    name: "Corduroy Jumper",
    description:
      "Nostalgic charm meets modern design. This classic corduroy jumper features adjustable straps and a comfortable fit that moves with ease. Perfect for everyday adventures, combining timeless appeal with contemporary comfort.",
    price: 7200, // $72.00
    images: generateImages(
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[1], // Girls
    slug: "corduroy-jumper",
    inStock: true,
    sku: "CJ-001",
  },
  {
    id: "prod-17",
    name: "Silk Scarf",
    description:
      "An elegant finishing touch for any ensemble. This luxurious silk scarf features a sophisticated print that adds refined polish to every look. Lightweight, versatile, and beautifully crafted to elevate even the simplest outfit.",
    price: 5500, // $55.00
    images: generateImages(
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "silk-scarf",
    inStock: true,
    tags: ["new"],
    sku: "SS-001",
  },
  {
    id: "prod-18",
    name: "Leather Mary Janes",
    description:
      "Timeless elegance in every step. These classic leather Mary Janes feature premium construction and exceptional comfort. Designed to transition seamlessly from play to special occasions, combining sophisticated style with lasting quality.",
    price: 8800, // $88.00
    images: generateImages(
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "leather-mary-janes",
    inStock: true,
    sku: "LMJ-001",
  },
  {
    id: "prod-19",
    name: "Velvet Blazer",
    description:
      "Uncompromising sophistication for life&apos;s most memorable moments. This luxurious velvet blazer features a precisely tailored fit and premium details that command attention. A statement piece that transforms any occasion into something extraordinary.",
    price: 16500, // $165.00
    images: generateImages(
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2064&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2064&auto=format&fit=crop"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[1], // Girls
    slug: "velvet-blazer",
    inStock: true,
    tags: ["new"],
    sku: "VB-001",
  },
  {
    id: "prod-20",
    name: "Wool Beanie",
    description:
      "Thoughtful warmth meets refined style. This cozy wool beanie is crafted from premium yarn, offering exceptional comfort and insulation. Designed to keep little ones warm while maintaining sophisticated appeal during cooler seasons.",
    price: 3500, // $35.00
    originalPrice: 4500, // $45.00 (on sale)
    images: generateImages(
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
    ),
    sizes: generateSizes(["2T", "3T", "4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "wool-beanie",
    inStock: true,
    tags: ["sale"],
    sku: "WB-001",
  },
];

