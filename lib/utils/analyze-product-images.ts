/**
 * Clothing Category Identification Guide
 * Use this to correctly categorize items from images
 */

export const clothingCategories = {
  // OUTERWEAR
  outerwear: {
    bomber: ['bomber jacket', 'flight jacket', 'varsity bomber'],
    denim: ['denim jacket', 'jean jacket', 'trucker jacket'],
    windbreaker: ['windbreaker', 'track jacket', 'shell jacket'],
    hoodie: ['zip hoodie', 'pullover hoodie', 'hooded jacket'],
    blazer: ['blazer', 'sport coat', 'suit jacket'],
    puffer: ['puffer jacket', 'down jacket', 'quilted jacket'],
    parka: ['parka', 'winter coat', 'hooded coat'],
    coach: ['coach jacket', 'coaches jacket'],
  },

  // TOPS
  tops: {
    tee: ['t-shirt', 'crew neck tee', 'graphic tee', 'basic tee'],
    polo: ['polo shirt', 'pique polo', 'collar shirt'],
    henley: ['henley', 'button henley'],
    sweater: ['sweater', 'pullover', 'knit sweater', 'crew neck sweater'],
    sweatshirt: ['sweatshirt', 'crewneck sweatshirt'],
    hoodie: ['hoodie', 'pullover hoodie', 'hooded sweatshirt'],
    button_up: ['button-up shirt', 'dress shirt', 'oxford shirt'],
    flannel: ['flannel shirt', 'plaid shirt'],
  },

  // BOTTOMS
  bottoms: {
    jeans: ['jeans', 'denim jeans', 'slim jeans', 'straight jeans', 'skinny jeans'],
    chinos: ['chinos', 'chino pants', 'dress pants'],
    joggers: ['joggers', 'sweatpants', 'track pants'],
    cargo: ['cargo pants', 'cargo trousers', 'utility pants'],
    shorts: ['shorts', 'chino shorts', 'denim shorts', 'athletic shorts'],
    sweatpants: ['sweatpants', 'fleece pants', 'lounge pants'],
  },

  // SHOES
  shoes: {
    sneakers: ['sneakers', 'trainers', 'athletic shoes', 'kicks'],
    boots: ['boots', 'chelsea boots', 'combat boots', 'work boots'],
    loafers: ['loafers', 'slip-ons', 'moccasins'],
    sandals: ['sandals', 'slides', 'flip-flops'],
  },

  // ACCESSORIES
  accessories: {
    hat: ['cap', 'baseball cap', 'beanie', 'bucket hat', 'snapback'],
    bag: ['backpack', 'messenger bag', 'crossbody bag', 'tote'],
    belt: ['belt', 'leather belt', 'canvas belt'],
    socks: ['socks', 'crew socks', 'ankle socks'],
  },
};

/**
 * Style Descriptors - Use these to enhance product names
 */
export const styleDescriptors = {
  premium: ['Heritage', 'Premium', 'Signature', 'Classic', 'Essential', 'Elevated'],
  casual: ['Everyday', 'Casual', 'Relaxed', 'Easy', 'Comfortable'],
  street: ['Street', 'Urban', 'Metro', 'City', 'Downtown'],
  active: ['Athletic', 'Performance', 'Sport', 'Active', 'Tech'],
  formal: ['Refined', 'Tailored', 'Polished', 'Dressed', 'Smart'],
};

/**
 * Material/Fabric identifiers visible in images
 */
export const fabricTypes = {
  denim: ['denim', 'jean'],
  cotton: ['cotton', 'jersey', 'pique'],
  fleece: ['fleece', 'sweat'],
  nylon: ['nylon', 'windbreaker', 'shell'],
  wool: ['wool', 'knit'],
  leather: ['leather', 'faux leather'],
  canvas: ['canvas'],
};

/**
 * Color analysis from images
 */
export const colorNames = {
  neutral: ['Black', 'White', 'Gray', 'Charcoal', 'Cream', 'Beige', 'Navy'],
  earth: ['Brown', 'Tan', 'Olive', 'Khaki', 'Sand'],
  bold: ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple'],
};

/**
 * Generate product name from visual analysis
 */
export function generateProductName(analysis: {
  category: string;
  style: string;
  material?: string;
  color?: string;
}): string {
  const { category, style, material, color } = analysis;
  
  // Examples:
  // "Heritage Denim Jacket"
  // "Premium Cotton Crew Tee"
  // "Street Essential Joggers"
  // "Classic Bomber Jacket"
  
  const parts = [];
  
  // Add style descriptor
  if (style) parts.push(style);
  
  // Add material if visible
  if (material) parts.push(material);
  
  // Add category
  parts.push(category);
  
  return parts.join(' ');
}

/**
 * Generate product description from visual
 */
export function generateProductDescription(analysis: {
  category: string;
  style: string;
  details: string[];
  occasion: string;
}): string {
  const { category, style, details, occasion } = analysis;
  
  // Template: Premium quality + key features + use case
  const templates = [
    `${style} ${category} crafted with ${details.join(', ')}. Perfect for ${occasion}.`,
    `Elevated ${category} featuring ${details.join(' and ')}. Designed for ${occasion}.`,
    `Premium ${category} with ${details.join(', ')}. A modern essential for ${occasion}.`,
  ];
  
  return templates[0];
}

/**
 * Analyze product image and suggest accurate name
 * This leverages vision capabilities to identify clothing items
 */
export interface ImageAnalysis {
  clothingType: string;
  specificStyle: string;
  material: string;
  aesthetic: string;
  details: string[];
  occasion: string;
  color: string;
}

export interface ProductSuggestion {
  suggestedName: string;
  suggestedDescription: string;
  analysis: ImageAnalysis;
  category: 'outerwear' | 'tops' | 'bottoms' | 'shoes' | 'accessories';
  priceRange: { min: number; max: number };
}

export function analyzeProductImage(imagePath: string): ProductSuggestion {
  // This function would analyze the image and return suggestions
  // For now, it's a placeholder structure that can be enhanced with actual image analysis
  
  const analysis: ImageAnalysis = {
    clothingType: '',
    specificStyle: '',
    material: '',
    aesthetic: '',
    details: [],
    occasion: '',
    color: '',
  };
  
  // Generate name
  const suggestedName = generateProductName({
    category: analysis.clothingType,
    style: analysis.aesthetic,
    material: analysis.material,
    color: analysis.color,
  });
  
  // Generate description
  const suggestedDescription = generateProductDescription({
    category: analysis.clothingType,
    style: analysis.aesthetic,
    details: analysis.details,
    occasion: analysis.occasion,
  });
  
  return {
    suggestedName,
    suggestedDescription,
    analysis,
    category: 'tops',
    priceRange: { min: 35, max: 65 },
  };
}
