/**
 * Product Image to Name Mapping
 * 
 * This file maps image files to their actual clothing items.
 * Each image should be analyzed to ensure product names match what's shown.
 * 
 * IMPORTANT: This mapping needs to be verified by viewing the actual images.
 */

export interface ImageToProductMapping {
  imagePath: string;
  actualClothingItem: string;
  suggestedProductName: string;
  category: 'outerwear' | 'tops' | 'bottoms' | 'shoes' | 'accessories' | 'dresses';
  priceRange: { min: number; max: number };
  description: string;
}

/**
 * Image Analysis Results
 * 
 * This mapping should be updated after analyzing each image file.
 * For now, these are educated guesses based on product names and file patterns.
 * 
 * TODO: Verify each image and update this mapping accordingly.
 */
export const imageProductMapping: ImageToProductMapping[] = [
  // Boys Products
  {
    imagePath: '/IMG_4673.png',
    actualClothingItem: 'Denim Jacket or Outerwear',
    suggestedProductName: 'Heritage Denim Jacket',
    category: 'outerwear',
    priceRange: { min: 85, max: 150 },
    description: 'Premium outerwear piece with classic styling',
  },
  {
    imagePath: '/4672.png',
    actualClothingItem: 'T-Shirt or Top',
    suggestedProductName: 'Premium Cotton Crew Tee',
    category: 'tops',
    priceRange: { min: 35, max: 65 },
    description: 'Essential everyday top',
  },
  {
    imagePath: '/4674.png',
    actualClothingItem: 'Pants or Bottoms',
    suggestedProductName: 'Classic Chino Pants',
    category: 'bottoms',
    priceRange: { min: 45, max: 85 },
    description: 'Versatile bottom piece',
  },
  {
    imagePath: '/4675.png',
    actualClothingItem: 'Hoodie or Sweatshirt',
    suggestedProductName: 'Urban Hoodie',
    category: 'outerwear',
    priceRange: { min: 65, max: 95 },
    description: 'Comfortable outerwear piece',
  },
  {
    imagePath: '/4676.png',
    actualClothingItem: 'Joggers or Athletic Pants',
    suggestedProductName: 'Athletic Joggers',
    category: 'bottoms',
    priceRange: { min: 45, max: 75 },
    description: 'Performance-oriented bottom',
  },
  {
    imagePath: '/4677.png',
    actualClothingItem: 'Polo Shirt or Top',
    suggestedProductName: 'Premium Polo Shirt',
    category: 'tops',
    priceRange: { min: 40, max: 65 },
    description: 'Classic collared top',
  },
  {
    imagePath: '/4678.png',
    actualClothingItem: 'Sneakers or Shoes',
    suggestedProductName: 'Canvas Sneakers',
    category: 'shoes',
    priceRange: { min: 50, max: 95 },
    description: 'Classic footwear',
  },
  {
    imagePath: '/4679.png',
    actualClothingItem: 'Shoes or Accessories',
    suggestedProductName: 'Canvas Sneakers',
    category: 'shoes',
    priceRange: { min: 50, max: 95 },
    description: 'Classic footwear',
  },
  {
    imagePath: '/4680.png',
    actualClothingItem: 'Sweater or Cardigan',
    suggestedProductName: 'Wool Blend Cardigan',
    category: 'outerwear',
    priceRange: { min: 75, max: 120 },
    description: 'Layered outerwear piece',
  },
  {
    imagePath: '/4681.png',
    actualClothingItem: 'Shorts or Bottoms',
    suggestedProductName: 'Cargo Shorts',
    category: 'bottoms',
    priceRange: { min: 45, max: 75 },
    description: 'Functional bottom piece',
  },
  {
    imagePath: '/4682.png',
    actualClothingItem: 'Backpack or Accessory',
    suggestedProductName: 'Leather Backpack',
    category: 'accessories',
    priceRange: { min: 85, max: 150 },
    description: 'Functional accessory',
  },
  // Girls Products
  {
    imagePath: '/4683.png',
    actualClothingItem: 'Dress or Top',
    suggestedProductName: 'Floral Print Dress',
    category: 'dresses',
    priceRange: { min: 65, max: 120 },
    description: 'Feminine dress piece',
  },
  {
    imagePath: '/4684.png',
    actualClothingItem: 'Dress or Skirt',
    suggestedProductName: 'Denim Skirt',
    category: 'bottoms',
    priceRange: { min: 50, max: 85 },
    description: 'Classic bottom piece',
  },
  {
    imagePath: '/4685.png',
    actualClothingItem: 'Dress or Outfit',
    suggestedProductName: 'Tulle Party Dress',
    category: 'dresses',
    priceRange: { min: 120, max: 200 },
    description: 'Special occasion dress',
  },
  {
    imagePath: '/IMG_4689.png',
    actualClothingItem: 'Outerwear or Jacket',
    suggestedProductName: 'Heritage Denim Jacket',
    category: 'outerwear',
    priceRange: { min: 85, max: 150 },
    description: 'Classic outerwear piece',
  },
];

/**
 * Get product suggestion for an image
 */
export function getProductSuggestionForImage(imagePath: string): ImageToProductMapping | null {
  return imageProductMapping.find(mapping => mapping.imagePath === imagePath) || null;
}

/**
 * Generate accurate product name based on image analysis
 */
export function generateAccurateProductName(
  imagePath: string,
  currentName: string
): string {
  const mapping = getProductSuggestionForImage(imagePath);
  if (mapping) {
    return mapping.suggestedProductName;
  }
  // Fallback: try to improve current name
  return currentName;
}
