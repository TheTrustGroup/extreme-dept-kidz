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
  // Hero Images - Using uploaded model images
  heroMain: {
    src: '/Extreme 1.png',
    alt: 'Young boy in premium streetwear exploring the city',
    category: 'hero',
    tags: ['hero', 'boys', 'streetwear', 'urban'],
    aspectRatio: 16 / 9,
    priority: true,
  },
  heroMain2: {
    src: '/Extreme 2.png',
    alt: 'Young boy in premium streetwear - lifestyle shot',
    category: 'hero',
    tags: ['hero', 'boys', 'streetwear', 'urban'],
    aspectRatio: 16 / 9,
    priority: false,
  },
  heroMainMobile: {
    src: '/Extreme 1.png',
    alt: 'Young boy in premium streetwear exploring the city',
    category: 'hero',
    tags: ['hero', 'boys', 'streetwear', 'mobile'],
    aspectRatio: 9 / 16,
    priority: true,
  },

  // Lifestyle - Boys Casual (using uploaded images)
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
    alt: 'Boy in casual streetwear outfit',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday'],
    aspectRatio: 3 / 4,
  },
  boyCasual4: {
    src: '/4675.png',
    alt: 'Boy in premium casual wear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual5: {
    src: '/4676.png',
    alt: 'Boy in streetwear style',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  boyCasual6: {
    src: '/4677.png',
    alt: 'Boy in premium basics',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday'],
    aspectRatio: 3 / 4,
  },
  boyCasual7: {
    src: '/4678.png',
    alt: 'Boy in comfortable casual wear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual8: {
    src: '/4679.png',
    alt: 'Boy in street-ready outfit',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  boyCasual9: {
    src: '/4680.png',
    alt: 'Boy in premium casual style',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday'],
    aspectRatio: 3 / 4,
  },
  boyCasual10: {
    src: '/4681.png',
    alt: 'Boy in comfortable streetwear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual11: {
    src: '/4682.png',
    alt: 'Boy in premium basics',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday'],
    aspectRatio: 3 / 4,
  },
  boyCasual12: {
    src: '/4683.png',
    alt: 'Boy in streetwear style',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  boyCasual13: {
    src: '/4684.png',
    alt: 'Boy in premium casual wear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual14: {
    src: '/4685.png',
    alt: 'Boy in comfortable outfit',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday'],
    aspectRatio: 3 / 4,
  },
  boyCasual15: {
    src: '/4686.png',
    alt: 'Boy in street-ready style',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  boyCasual16: {
    src: '/4687.png',
    alt: 'Boy in premium streetwear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual17: {
    src: '/4688.png',
    alt: 'Boy in casual premium basics',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday'],
    aspectRatio: 3 / 4,
  },
  boyCasual18: {
    src: '/IMG_4689.png',
    alt: 'Boy in comfortable streetwear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual19: {
    src: '/4690.png',
    alt: 'Boy in premium casual wear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  boyCasual20: {
    src: '/4691.png',
    alt: 'Boy in streetwear style',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday'],
    aspectRatio: 3 / 4,
  },
  boyCasual21: {
    src: '/4692.png',
    alt: 'Boy in premium basics',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual22: {
    src: '/4693.png',
    alt: 'Boy in comfortable outfit',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  boyCasual23: {
    src: '/4694.png',
    alt: 'Boy in street-ready style',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday'],
    aspectRatio: 3 / 4,
  },
  boyCasual24: {
    src: '/4695.png',
    alt: 'Boy in premium streetwear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },
  boyCasual25: {
    src: '/4696.png',
    alt: 'Boy in casual premium basics',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'streetwear'],
    aspectRatio: 3 / 4,
  },
  boyCasual26: {
    src: '/4697.png',
    alt: 'Boy in comfortable streetwear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'everyday'],
    aspectRatio: 3 / 4,
  },
  boyCasual27: {
    src: '/4698.png',
    alt: 'Boy in premium casual wear',
    category: 'lifestyle',
    tags: ['boys', 'casual', 'lifestyle'],
    aspectRatio: 3 / 4,
  },

  // Lifestyle - Boys Street
  boyStreet1: {
    src: '/Extreme 3.png',
    alt: 'Boy in urban streetwear outfit',
    category: 'lifestyle',
    tags: ['boys', 'streetwear', 'urban', 'fashion'],
    aspectRatio: 3 / 4,
  },
  boyStreet2: {
    src: '/Extreme 4.png',
    alt: 'Boy in premium streetwear style',
    category: 'lifestyle',
    tags: ['boys', 'streetwear', 'urban'],
    aspectRatio: 3 / 4,
  },
  boyStreet3: {
    src: '/Extreme 5.png',
    alt: 'Boy in urban fashion',
    category: 'lifestyle',
    tags: ['boys', 'streetwear', 'urban'],
    aspectRatio: 3 / 4,
  },

  // Complete Looks
  urbanExplorer: {
    src: '/4671.png',
    alt: 'Complete Urban Explorer look - bomber jacket, tee, jeans, sneakers',
    category: 'lifestyle',
    tags: ['complete-look', 'urban', 'boys', 'styled'],
    aspectRatio: 3 / 4,
  },
  playgroundReady: {
    src: '/4672.png',
    alt: 'Complete Playground Ready look - hoodie, joggers, sneakers',
    category: 'lifestyle',
    tags: ['complete-look', 'active', 'boys', 'styled'],
    aspectRatio: 3 / 4,
  },
  weekendCasual: {
    src: '/4674.png',
    alt: 'Complete Weekend Casual look - polo, shorts, canvas shoes',
    category: 'lifestyle',
    tags: ['complete-look', 'casual', 'boys', 'styled'],
    aspectRatio: 3 / 4,
  },
  miniGentleman: {
    src: '/4675.png',
    alt: 'Complete Mini Gentleman look - refined casual style',
    category: 'lifestyle',
    tags: ['complete-look', 'formal', 'boys', 'styled'],
    aspectRatio: 3 / 4,
  },

  // Collection Headers
  boysCollectionHero: {
    src: '/Extreme 2.png',
    alt: 'Boys collection featuring premium streetwear styles',
    category: 'collection',
    tags: ['boys', 'collection', 'header'],
    aspectRatio: 21 / 9,
  },
  newArrivalsHero: {
    src: '/Extreme 3.png',
    alt: 'New arrivals - latest styles for boys',
    category: 'collection',
    tags: ['new-arrivals', 'boys', 'header'],
    aspectRatio: 21 / 9,
  },

  // Editorial
  editorial1: {
    src: '/Extreme 4.png',
    alt: 'Behind the scenes of Extreme Dept Kidz photoshoot',
    category: 'editorial',
    tags: ['editorial', 'brand', 'story'],
    aspectRatio: 4 / 3,
  },
  editorial2: {
    src: '/Extreme 5.png',
    alt: 'Boys modeling premium kids fashion',
    category: 'editorial',
    tags: ['editorial', 'brand', 'lifestyle'],
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

/**
 * Get lifestyle images for boys (shuffled selection)
 */
export function getLifestyleBoysImages(count = 6): ModelImage[] {
  const lifestyleImages = getImagesByTag('boys').filter(
    (img) => img.category === 'lifestyle'
  );
  // Shuffle and return requested count
  const shuffled = [...lifestyleImages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
