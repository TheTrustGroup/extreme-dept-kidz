/**
 * Test suite setup for Extreme Dept Kidz
 * Run comprehensive tests before deployment
 */

// Mock environment variables (using Object.assign to avoid readonly errors)
Object.assign(process.env, {
  ...(process.env.DATABASE_URL ? {} : { DATABASE_URL: 'mock://localhost' }),
  ...(process.env.JWT_SECRET ? {} : { JWT_SECRET: 'test-secret-key-minimum-32-characters-long' }),
});

// Global test utilities
(global as any).testUtils = {
  mockProduct: {
    id: 'test-product',
    name: 'Test Product',
    price: 100,
    category: 'tops',
    images: ['/test-image.jpg'],
    sizes: [{ size: '8', quantity: 10 }],
    inStock: true,
  },
  mockUser: {
    id: 'test-user',
    email: 'test@test.com',
    role: 'admin',
  },
};

export {};
