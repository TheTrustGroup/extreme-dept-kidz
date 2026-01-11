/**
 * Mock Reviews Data
 */

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verified: boolean;
  date: string;
  helpful: number;
  images?: string[];
}

export const reviews: Review[] = [
  {
    id: 'rev_1',
    productId: 'blue-patterned-shirt',
    author: 'Sarah M.',
    rating: 5,
    title: 'Perfect for special occasions',
    comment: 'My son looks so handsome in this shirt! The quality is excellent and it fits true to size. The pattern is beautiful and the fabric is comfortable.',
    verified: true,
    date: '2024-01-05',
    helpful: 12,
  },
  {
    id: 'rev_2',
    productId: 'blue-patterned-shirt',
    author: 'Michael K.',
    rating: 4,
    title: 'Great quality, runs slightly large',
    comment: 'Love the design and quality. However, I would recommend sizing down as it runs a bit large. Overall very satisfied!',
    verified: true,
    date: '2024-01-10',
    helpful: 8,
  },
  {
    id: 'rev_3',
    productId: 'navy-tailored-trousers',
    author: 'Jennifer L.',
    rating: 5,
    title: 'Perfect fit and quality',
    comment: 'These trousers are exactly what we needed. The fit is perfect and the quality is outstanding. Highly recommend!',
    verified: true,
    date: '2024-01-08',
    helpful: 15,
  },
];
