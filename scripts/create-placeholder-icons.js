/**
 * Placeholder Icon Generator (Fallback)
 * 
 * Creates simple placeholder icons when ImageMagick/Sharp are not available.
 * These are basic colored squares that will prevent 404 errors.
 * 
 * Run: node scripts/create-placeholder-icons.js
 * 
 * For production icons, use: npm run generate-icons (requires ImageMagick or Sharp)
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Simple SVG to PNG conversion using a basic approach
// This creates minimal valid PNG files (1x1 pixel, then we'll instruct user to replace)

const icons = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 },
  { name: 'apple-touch-icon-76x76.png', size: 76 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-maskable-192x192.png', size: 192 },
  { name: 'icon-maskable-512x512.png', size: 512 },
];

// Create a minimal valid PNG (1x1 transparent pixel)
// This is a valid PNG that prevents 404 errors
// User should replace with actual icons using ImageMagick/Sharp
const minimalPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // width: 1
  0x00, 0x00, 0x00, 0x01, // height: 1
  0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
  0x1F, 0x15, 0xC4, 0x89, // CRC
  0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
  0x0D, 0x0A, 0x2D, 0xB4, // CRC
  0x00, 0x00, 0x00, 0x00, // IEND chunk length
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82, // CRC
]);

console.log('🎨 Creating placeholder icons (prevents 404 errors)...\n');
console.log('⚠️  These are minimal placeholders. For production, run: npm run generate-icons\n');

icons.forEach(icon => {
  const filePath = path.join(PUBLIC_DIR, icon.name);
  
  // Create minimal PNG to prevent 404
  fs.writeFileSync(filePath, minimalPNG);
  console.log(`✅ Created placeholder: ${icon.name} (${icon.size}x${icon.size})`);
});

// Create favicon.ico (minimal ICO file)
const faviconPath = path.join(PUBLIC_DIR, 'favicon.ico');
// Minimal ICO file (16x16, 32x32, 48x48)
const minimalICO = Buffer.from([
  0x00, 0x00, 0x01, 0x00, 0x03, 0x00, // ICO header
  0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00, // Entry 1: 16x16
  0x68, 0x04, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  0x20, 0x20, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00, // Entry 2: 32x32
  0x28, 0x05, 0x00, 0x00, 0x7E, 0x04, 0x00, 0x00,
  0x30, 0x30, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00, // Entry 3: 48x48
  0xE8, 0x05, 0x00, 0x00, 0xA6, 0x09, 0x00, 0x00,
  // Minimal bitmap data (simplified)
  ...Array(1024).fill(0x00), // Placeholder bitmap data
]);

fs.writeFileSync(faviconPath, minimalICO);
console.log(`✅ Created placeholder: favicon.ico\n`);

console.log('📋 Next steps:');
console.log('  1. Install ImageMagick: brew install imagemagick (macOS)');
console.log('  2. Run: npm run generate-icons');
console.log('  3. Or manually create icons from "Extreme Logo.png" using any image editor');
console.log('  4. Replace placeholder files in /public directory\n');

console.log('✅ Placeholder icons created - 404 errors prevented!');
