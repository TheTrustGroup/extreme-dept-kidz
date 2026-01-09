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
    image: "/4671.png",
    isActive: true,
  },
  {
    id: "cat-girls",
    name: "Girls",
    slug: "girls",
    description: "Luxury fashion for girls",
    image: "/4675.png",
    isActive: true,
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Premium accessories and essentials",
    image: "/4681.png",
    isActive: true,
  },
  {
    id: "cat-new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "Latest additions to our collection",
    image: "/4677.png",
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
      "/4677.png",
    isActive: true,
  },
  {
    id: "coll-street-essentials",
    name: "Street Essentials",
    slug: "street-essentials",
    description: "Urban-inspired streetwear for modern kids",
    image:
      "/4677.png",
    isActive: true,
  },
  {
    id: "coll-premium-basics",
    name: "Premium Basics",
    slug: "premium-basics",
    description: "Timeless essentials crafted with premium materials",
    image:
      "/4679.png",
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
  tertiaryUrl?: string,
  productName?: string
): ProductImage[] {
  const baseAlt = productName || "Product";
  const images: ProductImage[] = [
    { url: primaryUrl, isPrimary: true, alt: `${baseAlt} - primary view` },
  ];
  if (secondaryUrl) {
    images.push({ url: secondaryUrl, alt: `${baseAlt} - alternate view` });
  }
  if (tertiaryUrl) {
    images.push({ url: tertiaryUrl, alt: `${baseAlt} - detail view` });
  }
  return images;
}

/**
 * Mock Products
 * Updated to match actual product images
 */
export const mockProducts: Product[] = [
  // NEW ARRIVALS - Just Dropped Section
  {
    id: "boys-signature-sunset-tee-white",
    name: "Signature Sunset Graphic Tee",
    description:
      "Oversized streetwear tee with dual graphics - signature script logo on chest and vibrant tropical sunset scene on back. Premium cotton with dropped shoulders. Statement piece that turns heads.",
    price: 5200, // $52.00
    images: generateImages(
      "/4671.png",
      "/4672.png",
      undefined,
      "Signature Sunset Graphic Tee"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "signature-sunset-graphic-tee",
    inStock: true,
    tags: ["new", "bestseller"],
    sku: "SSG-001",
  },
  {
    id: "boys-utility-vest-orange",
    name: "Street Utility Vest",
    description:
      "Bold safety orange vest with signature cross logo. Zip closure with functional pockets. Statement layering piece that demands attention.",
    price: 7800, // $78.00
    images: generateImages(
      "/4674.png",
      "/4675.png",
      undefined,
      "Street Utility Vest"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "street-utility-vest",
    inStock: true,
    tags: ["new"],
    sku: "SUV-001",
  },
  {
    id: "boys-classic-denim-jeans-medium",
    name: "Classic Straight Denim Jeans",
    description:
      "Medium wash denim with authentic worn-in look. Comfortable straight fit with quality construction. Perfect foundation for any street style look.",
    price: 7200, // $72.00
    originalPrice: 8500, // $85.00 (on sale)
    images: generateImages(
      "/4675.png",
      "/4676.png",
      undefined,
      "Classic Straight Denim Jeans"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "classic-straight-denim-jeans",
    inStock: true,
    tags: ["new"],
    sku: "CSD-001",
  },
  {
    id: "boys-urban-graphic-tee-black",
    name: "Urban Scene Graphic Tee",
    description:
      "Bold oversized tee featuring vibrant cityscape and lowrider graphics. Eye-catching yellow text. Premium cotton construction for all-day comfort.",
    price: 4800, // $48.00
    images: generateImages(
      "/4677.png",
      "/4678.png",
      undefined,
      "Urban Scene Graphic Tee"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "urban-scene-graphic-tee",
    inStock: true,
    tags: ["new"],
    sku: "USG-001",
  },
  {
    id: "boys-camo-distressed-shorts",
    name: "Camo Distressed Cargo Shorts",
    description:
      "Rugged camo print shorts with authentic distressed hem. Multiple cargo pockets for utility. Perfect for summer street style and active days.",
    price: 5800, // $58.00
    images: generateImages(
      "/4679.png",
      "/4680.png",
      undefined,
      "Camo Distressed Cargo Shorts"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "camo-distressed-cargo-shorts",
    inStock: true,
    tags: ["new"],
    sku: "CDS-001",
  },
  {
    id: "boys-court-sneakers-black-white",
    name: "Court High-Top Sneakers",
    description:
      "Classic high-top sneakers in iconic black and white colorway. Premium construction with blue accent details. Elevated street style essential.",
    price: 8500, // $85.00
    images: generateImages(
      "/4681.png",
      "/4682.png",
      undefined,
      "Court High-Top Sneakers"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "court-high-top-sneakers",
    inStock: true,
    tags: ["new"],
    sku: "CHS-001",
  },
  {
    id: "boys-layered-graphic-tee-black",
    name: "Layered Graphic Tee",
    description:
      "Black graphic tee designed for layering. Bold yellow print stands out under vests and jackets. Essential streetwear foundation piece.",
    price: 4200, // $42.00
    images: generateImages(
      "/4683.png",
      "/4684.png",
      undefined,
      "Layered Graphic Tee"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "layered-graphic-tee",
    inStock: true,
    tags: ["bestseller"],
    sku: "LGT-001",
  },
  {
    id: "boys-straight-pants-black-premium",
    name: "Premium Straight Pants",
    description:
      "Elevated black pants with comfortable straight fit. Quality construction meets street style. Works with everything in their wardrobe.",
    price: 6800, // $68.00
    images: generateImages(
      "/4685.png",
      "/4686.png",
      undefined,
      "Premium Straight Pants"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "premium-straight-pants",
    inStock: true,
    tags: ["new"],
    sku: "PSP-001",
  },
  {
    id: "boys-chunky-sneakers-tri-color",
    name: "Chunky Sport Sneakers",
    description:
      "Bold chunky sneakers with yellow, black, and white colorway. Retro-inspired design with modern comfort. Statement footwear for the confident kid.",
    price: 9200, // $92.00
    images: generateImages(
      "/4687.png",
      "/4688.png",
      undefined,
      "Chunky Sport Sneakers"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "chunky-sport-sneakers",
    inStock: true,
    tags: ["new"],
    sku: "CSS-001",
  },
  {
    id: "boys-tactical-boots-black",
    name: "Tactical Street Boots",
    description:
      "Rugged black boots with streetwear edge. Durable construction for active kids. Comfortable all-day wear with style.",
    price: 9500, // $95.00
    images: generateImages(
      "/4689.png",
      "/4690.png",
      undefined,
      "Tactical Street Boots"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "tactical-street-boots",
    inStock: true,
    tags: ["new"],
    sku: "TSB-001",
  },
  // Additional Products (Unique Images)
  {
    id: "boys-classic-sneakers",
    name: "Classic Canvas Sneakers",
    description:
      "Iconic design elevated through premium construction. These classic canvas sneakers combine exceptional comfort with enduring durability, creating a versatile foundation for any ensemble. Timeless style that stands the test of time.",
    price: 6500, // $65.00
    images: generateImages(
      "/4695.png",
      "/4696.png",
      undefined,
      "Classic Canvas Sneakers"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "classic-canvas-sneakers",
    inStock: true,
    tags: ["new"],
    sku: "CCS-001",
  },
  {
    id: "boys-heritage-cardigan",
    name: "Heritage Wool Cardigan",
    description:
      "Luxurious warmth meets refined versatility. This sumptuous wool-blend cardigan is designed for effortless layering, offering exceptional softness and sophisticated style. A versatile essential that transitions seamlessly from casual to elevated occasions.",
    price: 9500, // $95.00
    images: generateImages(
      "/4697.png",
      "/4698.png",
      undefined,
      "Heritage Wool Cardigan"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[0], // Boys
    slug: "heritage-wool-cardigan",
    inStock: true,
    sku: "HWC-001",
  },
  // Girls Products
  {
    id: "girls-premium-sweater",
    name: "Premium Cashmere Sweater",
    description:
      "Indulgent luxury in its purest form. This sumptuous cashmere-blend sweater offers a relaxed, confident fit with exceptional softness and warmth. A timeless investment piece that elevates any ensemble while providing unmatched comfort.",
    price: 14500, // $145.00
    images: generateImages(
      "/IMG_4673.png",
      "/IMG_4689.png",
      undefined,
      "Premium Cashmere Sweater"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[1], // Girls
    slug: "premium-cashmere-sweater",
    inStock: true,
    tags: ["bestseller"],
    sku: "PCS-001",
  },
  {
    id: "girls-denim-skirt",
    name: "Classic A-Line Denim Skirt",
    description:
      "A modern classic reimagined. This A-line denim skirt is crafted from premium denim fabric, offering a comfortable fit and timeless silhouette. Versatile enough for play, sophisticated enough for special moments.",
    price: 6200, // $62.00
    images: generateImages(
      "/4671.png",
      "/4672.png",
      undefined,
      "Classic A-Line Denim Skirt"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[1], // Girls
    slug: "classic-a-line-denim-skirt",
    inStock: true,
    sku: "CDS-001",
  },
  // Accessories
  {
    id: "accessory-leather-backpack",
    name: "Premium Leather Backpack",
    description:
      "A sophisticated companion for every adventure. Crafted from premium leather with adjustable straps, this backpack features a thoughtfully designed spacious main compartment and front pocket. Where functionality meets refined style, built to last through countless journeys.",
    price: 12500, // $125.00
    images: generateImages(
      "/4691.png",
      "/4692.png",
      undefined,
      "Premium Leather Backpack"
    ),
    sizes: generateSizes(["6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "premium-leather-backpack",
    inStock: true,
    tags: ["new"],
    sku: "PLB-001",
  },
  {
    id: "accessory-wool-beanie",
    name: "Wool Beanie",
    description:
      "Thoughtful warmth meets refined style. This cozy wool beanie is crafted from premium yarn, offering exceptional comfort and insulation. Designed to keep little ones warm while maintaining sophisticated appeal during cooler seasons.",
    price: 3500, // $35.00
    originalPrice: 4500, // $45.00 (on sale)
    images: generateImages(
      "/4693.png",
      "/4694.png",
      undefined,
      "Wool Beanie"
    ),
    sizes: generateSizes(["4T", "5T", "6", "8", "10", "12"]),
    category: mockCategories[2], // Accessories
    slug: "wool-beanie",
    inStock: true,
    tags: ["sale"],
    sku: "WB-001",
  },
];

