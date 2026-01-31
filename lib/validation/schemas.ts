/**
 * COMPREHENSIVE INPUT VALIDATION
 * Zod schemas for all API inputs
 */

import { z } from 'zod';

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  price: z.union([
    z.number().positive('Price must be positive').max(1000000), // Allow up to $10,000
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) throw new Error('Price must be a positive number');
      return num;
    }),
  ]).pipe(z.number().positive('Price must be positive').max(1000000)),
  originalPrice: z.union([
    z.number().positive().optional(),
    z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  ]).optional(),
  category: z.union([
    z.enum(['tops', 'bottoms', 'outerwear', 'shoes', 'accessories']),
    z.object({
      id: z.string(),
      name: z.string().optional(),
      slug: z.string().optional(),
    }),
  ]).optional(),
  categoryId: z.string().min(1, 'Category is required'), // Required, accept any non-empty string
  gender: z.enum(['boys', 'girls', 'unisex']).optional(),
  images: z.union([
    // Array of URL strings (allow relative paths, absolute URLs, and data URLs)
    z.array(z.string().min(1, 'Image URL cannot be empty').refine(
      (url) => {
        // Allow relative paths, absolute URLs, and data URLs
        return url.startsWith('/') || 
               url.startsWith('http://') || 
               url.startsWith('https://') || 
               url.startsWith('data:') ||
               url.startsWith('./') ||
               url.startsWith('../');
      },
      { message: 'Image URL must be a valid path or URL' }
    )).min(1, 'At least one image required').max(10),
    // Array of image objects
    z.array(z.object({
      url: z.string().min(1, 'Image URL cannot be empty'),
      alt: z.string().optional(),
      isPrimary: z.boolean().optional(),
    })).min(1, 'At least one image required').max(10).transform((arr) => arr.map(img => img.url)),
  ]).pipe(z.array(z.string().min(1, 'Image URL cannot be empty')).min(1, 'At least one image required').max(10)),
  sizes: z.array(z.object({
    size: z.string().min(1, 'Size is required'),
    quantity: z.union([
      z.number().int().min(0),
      z.string().transform((val) => {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 0) throw new Error('Quantity must be a non-negative integer');
        return num;
      }),
    ]).pipe(z.number().int().min(0)),
    sku: z.string().optional(),
    inStock: z.boolean().optional(), // Allow but ignore
    stock: z.union([
      z.number().optional(),
      z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
    ]).optional(), // Allow but will use quantity instead
  })).min(1, 'At least one size required'),
  tags: z.union([
    z.array(z.string()),
    z.array(z.string()).optional(),
  ]).optional().default([]),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  slug: z.string().min(1).max(200).optional(),
  sku: z.string().min(1).max(100).optional(),
  inStock: z.boolean().optional(),
  visibleOnStore: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  // Allow partial updates - all fields optional
  name: z.string().min(1, 'Name is required').max(200, 'Name too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000).optional(),
  price: z.union([
    z.number().positive('Price must be positive').max(1000000),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) throw new Error('Price must be a positive number');
      return num;
    }),
  ]).pipe(z.number().positive('Price must be positive').max(1000000)).optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  images: z.union([
    z.array(z.string().min(1, 'Image URL cannot be empty').refine(
      (url) => {
        return url.startsWith('/') || 
               url.startsWith('http://') || 
               url.startsWith('https://') || 
               url.startsWith('data:') ||
               url.startsWith('./') ||
               url.startsWith('../');
      },
      { message: 'Image URL must be a valid path or URL' }
    )).min(1, 'At least one image required').max(10),
    z.array(z.object({
      url: z.string().min(1, 'Image URL cannot be empty'),
      alt: z.string().optional(),
      isPrimary: z.boolean().optional(),
    })).min(1, 'At least one image required').max(10).transform((arr) => arr.map(img => img.url)),
  ]).pipe(z.array(z.string().min(1, 'Image URL cannot be empty')).min(1, 'At least one image required').max(10)).optional(),
  sizes: z.array(z.object({
    size: z.string().min(1, 'Size is required'),
    quantity: z.union([
      z.number().int().min(0),
      z.string().transform((val) => {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 0) throw new Error('Quantity must be a non-negative integer');
        return num;
      }),
    ]).pipe(z.number().int().min(0)),
    sku: z.string().optional(),
  })).min(1, 'At least one size required').optional(),
  visibleOnStore: z.boolean().optional(),
});

// Category schemas - base schema without transform
const categorySchemaBase = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  slug: z.string().max(100).optional().or(z.literal('')), // Allow empty string for auto-generation
  image: z.string().url().optional().or(z.literal('')), // Allow empty string
  isActive: z.boolean().default(true),
});

// Transform function to convert empty strings to undefined
const transformEmptyStrings = <T extends { slug?: string; image?: string; description?: string }>(data: T) => ({
  ...data,
  // Convert empty strings to undefined for optional fields
  slug: (data.slug === '' || !data.slug) ? undefined : data.slug,
  image: (data.image === '' || !data.image) ? undefined : data.image,
  description: (data.description === '' || !data.description) ? undefined : data.description,
});

export const createCategorySchema = categorySchemaBase.transform(transformEmptyStrings);

// For update, apply partial() BEFORE transform
export const updateCategorySchema = categorySchemaBase.partial().transform(transformEmptyStrings);

// Collection schemas
export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  slug: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const updateCollectionSchema = createCollectionSchema.partial();

// Complete Look schemas
export const createCompleteLookSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  mainImage: z.string().min(1, 'Main image is required').refine(
    (url) => {
      return url.startsWith('/') || 
             url.startsWith('http://') || 
             url.startsWith('https://') || 
             url.startsWith('data:');
    },
    { message: 'Main image must be a valid URL or path' }
  ),
  bundlePrice: z.union([
    z.number().positive('Bundle price must be positive').max(1000000),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) throw new Error('Bundle price must be a positive number');
      return num;
    }),
  ]).pipe(z.number().positive('Bundle price must be positive').max(1000000)),
  bundleDiscount: z.number().min(0).max(100).optional(),
  featured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  ageRange: z.string().max(50).optional(),
  tags: z.array(z.string()).max(20).optional().default([]),
  productIds: z.array(z.string().min(1)).min(2, 'At least 2 products required').max(10, 'Maximum 10 products allowed'),
  requiredProductIds: z.array(z.string()).optional().default([]), // Products that are required (others optional)
});

export const updateCompleteLookSchema = createCompleteLookSchema.partial().extend({
  productIds: z.array(z.string().min(1)).min(2, 'At least 2 products required').max(10, 'Maximum 10 products allowed').optional(),
});

// Order schemas
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    size: z.string(),
    price: z.number().positive(),
  })).min(1),
  customer: z.object({
    email: z.string().email('Invalid email'),
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
  }),
  shipping: z.object({
    address: z.string().min(10, 'Address must be at least 10 characters'),
    city: z.string().min(2, 'City is required'),
    country: z.string().min(2, 'Country is required'),
    postalCode: z.string().min(3, 'Postal code is required'),
  }),
  payment: z.object({
    method: z.enum(['card', 'mobile_money', 'bank_transfer']),
  }),
});

// Admin schemas
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Inventory update schema
export const updateInventorySchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(0),
  action: z.enum(['set', 'add', 'subtract']).default('set'),
});

// Image upload schema
export const imageUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'File must be an image (JPEG, PNG, or WebP)'
  ),
});

// Validation result types for better type narrowing
export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationFailure = { success: false; errors: Record<string, string> };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

// Type guard function for better type narrowing
export function isValid<T>(result: ValidationResult<T>): result is ValidationSuccess<T> {
  return result.success === true;
}

// Helper to validate and return errors
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _general: 'Validation failed' } };
  }
}
