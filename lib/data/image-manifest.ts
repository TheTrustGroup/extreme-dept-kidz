/**
 * Central image manifest - maps all lifestyle images to their uses
 * Update this when adding new images
 */

export interface ModelImage {
  src: string;
  alt: string;
  category: 'hero' | 'lifestyle' | 'product' | 'editorial' | 'collection';
  tags: string[];
  aspectRatio?: number;
  priority?: boolean;
}

export const modelImages: Record<string, ModelImage> = {
  // Hero Images
  heroMain: {
    src: '/4671.png',
    alt: 'Young boy in premium streetwear exploring the city',
    category: 'hero',
    tags: ['hero', 'boys', 'streetwear', 'urban'],
    aspectRatio: 16 / 9,
    priority: true,
  },
  heroMain2: {
    src: '/4672.png',
    alt: 'Young boy in premium streetwear lifestyle shot',
    category: 'hero',
    tags: ['hero', 'boys', 'streetwear', 'lifestyle'],
    aspectRatio: 16 / 9,
    priority: false,
  },
  heroMain3: {
    src: '/4675.png',
    alt: 'Young boy in premium streetwear urban setting',
    category: 'hero',
    tags: ['hero', 'boys', 'streetwear', 'urban'],
    aspectRatio: 16 / 9,
    priority: false,
  },
  heroMain4: {
    src: '/4677.png',
    alt: 'Young boy in premium streetwear casual style',
    category: 'hero',
    tags: ['hero', 'boys', 'streetwear', 'casual'],
    aspectRatio: 16 / 9,
    priority: false,
  },
  heroMain5: {
    src: '/4679.png',
    alt: 'Young boy in premium streetwear active style',
    category: 'hero',
    tags: ['hero', 'boys', 'streetwear', 'active'],
    aspectRatio: 16 / 9,
    priority: false,
  },

  // Lifestyle - Boys Casual (using numbered images)
  boyCasual1: {
    src: '/4671.png',
    alt: 'Boy wearing casual premium basics outdoors',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual2: {
    src: '/4672.png',
    alt: 'Boy in comfortable streetwear playing',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'play', 'active'],
    aspectRatio: 3 / 4,
  },
  boyCasual3: {
    src: '/4674.png',
    alt: 'Boy in premium casual wear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual4: {
    src: '/4675.png',
    alt: 'Boy in streetwear casual style',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'streetwear'],
    aspectRatio: 3 / 4,
  },

  // Lifestyle - Boys Street
  boyStreet1: {
    src: '/4676.png',
    alt: 'Boy in urban streetwear outfit',
    category: 'lifestyle',
    tags: ['boys', 'streetwear', 'urban', 'fashion'],
    aspectRatio: 3 / 4,
  },
  boyStreet2: {
    src: '/4677.png',
    alt: 'Boy in premium streetwear',
    category: 'lifestyle',
    tags: ['boys', 'streetwear', 'urban'],
    aspectRatio: 3 / 4,
  },
  boyStreet3: {
    src: '/4678.png',
    alt: 'Boy in urban fashion style',
    category: 'lifestyle',
    tags: ['boys', 'streetwear', 'fashion'],
    aspectRatio: 3 / 4,
  },

  // Lifestyle - Boys Active
  boyActive1: {
    src: '/4679.png',
    alt: 'Boy in activewear running and playing',
    category: 'lifestyle',
    tags: ['boys', 'active', 'sports', 'playground'],
    aspectRatio: 3 / 4,
  },
  boyActive2: {
    src: '/4680.png',
    alt: 'Boy in active lifestyle wear',
    category: 'lifestyle',
    tags: ['boys', 'active', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyActive3: {
    src: '/4681.png',
    alt: 'Boy in premium activewear',
    category: 'lifestyle',
    tags: ['boys', 'active', 'sports'],
    aspectRatio: 3 / 4,
  },

  // Complete Looks - Using various images for styled looks
  urbanExplorer: {
    src: '/4682.png',
    alt: 'Complete Urban Explorer look - bomber jacket, tee, jeans, sneakers',
    category: 'lifestyle',
    tags: ['complete-look', 'urban', 'boys', 'styled'],
    aspectRatio: 3 / 4,
  },
  playgroundReady: {
    src: '/4683.png',
    alt: 'Complete Playground Ready look - hoodie, joggers, sneakers',
    category: 'lifestyle',
    tags: ['complete-look', 'active', 'boys', 'styled'],
    aspectRatio: 3 / 4,
  },
  weekendCasual: {
    src: '/4684.png',
    alt: 'Complete Weekend Casual look - polo, shorts, canvas shoes',
    category: 'lifestyle',
    tags: ['complete-look', 'casual', 'boys', 'styled'],
    aspectRatio: 3 / 4,
  },
  miniGentleman: {
    src: '/4685.png',
    alt: 'Complete Mini Gentleman look - refined streetwear',
    category: 'lifestyle',
    tags: ['complete-look', 'formal', 'boys', 'styled'],
    aspectRatio: 3 / 4,
  },

  // Additional lifestyle shots
  lifestyle1: {
    src: '/4686.png',
    alt: 'Boy in premium kids fashion',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'fashion'],
    aspectRatio: 3 / 4,
  },
  lifestyle2: {
    src: '/4687.png',
    alt: 'Boy modeling streetwear',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  lifestyle3: {
    src: '/4688.png',
    alt: 'Boy in urban setting',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'urban'],
    aspectRatio: 3 / 4,
  },
  lifestyle4: {
    src: '/4690.png',
    alt: 'Boy in premium casual wear',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'casual'],
    aspectRatio: 3 / 4,
  },
  lifestyle5: {
    src: '/4691.png',
    alt: 'Boy in streetwear style',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  lifestyle6: {
    src: '/4692.png',
    alt: 'Boy in premium fashion',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'fashion'],
    aspectRatio: 3 / 4,
  },
  lifestyle7: {
    src: '/4693.png',
    alt: 'Boy in casual premium wear',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'casual'],
    aspectRatio: 3 / 4,
  },
  lifestyle8: {
    src: '/4694.png',
    alt: 'Boy in urban streetwear',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  lifestyle9: {
    src: '/4695.png',
    alt: 'Boy in premium kids fashion',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'fashion'],
    aspectRatio: 3 / 4,
  },
  lifestyle10: {
    src: '/4696.png',
    alt: 'Boy in streetwear style',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  lifestyle11: {
    src: '/4697.png',
    alt: 'Boy in premium casual wear',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'casual'],
    aspectRatio: 3 / 4,
  },
  lifestyle12: {
    src: '/4698.png',
    alt: 'Boy in urban fashion',
    category: 'lifestyle',
    tags: ['boys', 'lifestyle', 'fashion'],
    aspectRatio: 3 / 4,
  },

  // Collection Headers
  boysCollectionHero: {
    src: '/4671.png',
    alt: 'Boys collection featuring premium streetwear styles',
    category: 'collection',
    tags: ['boys', 'collection', 'header'],
    aspectRatio: 21 / 9,
  },
  newArrivalsHero: {
    src: '/4677.png',
    alt: 'New arrivals - latest styles for boys',
    category: 'collection',
    tags: ['new-arrivals', 'boys', 'header'],
    aspectRatio: 21 / 9,
  },

  // Editorial
  editorial1: {
    src: '/4681.png',
    alt: 'Behind the scenes photoshoot',
    category: 'editorial',
    tags: ['editorial', 'brand', 'story'],
    aspectRatio: 4 / 3,
  },
  editorial2: {
    src: '/4683.png',
    alt: 'Boys modeling premium kids fashion',
    category: 'editorial',
    tags: ['editorial', 'brand', 'lifestyle'],
    aspectRatio: 4 / 3,
  },

  // Product-Specific Model Shots
  heritageBomberModel: {
    src: '/IMG_4673.png',
    alt: 'Heritage Bomber Jacket styled on young model',
    category: 'product',
    tags: ['product', 'heritage-bomber', 'outerwear', 'model'],
    aspectRatio: 3 / 4,
  },
  heritageBomberLifestyle: {
    src: '/IMG_4689.png',
    alt: 'Boy wearing Heritage Bomber in urban setting',
    category: 'product',
    tags: ['product', 'heritage-bomber', 'lifestyle', 'urban'],
    aspectRatio: 4 / 3,
  },
};

/**
 * Helper function to get image by tag
 */
export function getImagesByTag(tag: string): ModelImage[] {
  return Object.values(modelImages).filter((img) =>
    img.tags.includes(tag)
  );
}

/**
 * Helper function to get image by category
 */
export function getImagesByCategory(
  category: ModelImage['category']
): ModelImage[] {
  return Object.values(modelImages).filter(
    (img) => img.category === category
  );
}

/**
 * Get random image from tag
 */
export function getRandomImageByTag(tag: string): ModelImage | null {
  const images = getImagesByTag(tag);
  if (images.length === 0) return null;
  return images[Math.floor(Math.random() * images.length)];
}
