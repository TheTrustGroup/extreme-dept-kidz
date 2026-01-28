/**
 * Placeholder Splash Screen Generator
 * 
 * Creates minimal placeholder splash screens to prevent 404 errors.
 * These are basic colored images that will prevent errors.
 * 
 * Run: node scripts/create-placeholder-splash-screens.js
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Minimal valid PNG (1x1 pixel with background color)
const minimalPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01,
  0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00,
  0x1F, 0x15, 0xC4, 0x89,
  0x00, 0x00, 0x00, 0x0A,
  0x49, 0x44, 0x41, 0x54,
  0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
  0x0D, 0x0A, 0x2D, 0xB4,
  0x00, 0x00, 0x00, 0x00,
  0x49, 0x45, 0x4E, 0x44,
  0xAE, 0x42, 0x60, 0x82,
]);

const splashScreens = [
  'splash-iphone-14-pro-max.png',
  'splash-iphone-14-plus.png',
  'splash-iphone-14.png',
  'splash-iphone-11-pro-max.png',
  'splash-iphone-11.png',
  'splash-iphone-8-plus.png',
  'splash-iphone-8.png',
  'splash-ipad-pro-12-9.png',
  'splash-ipad-pro-11.png',
  'splash-ipad.png',
];

console.log('🎨 Creating placeholder splash screens (prevents 404 errors)...\n');
console.log('⚠️  These are minimal placeholders. For production, run: npm run generate-splash-screens\n');

splashScreens.forEach(name => {
  const filePath = path.join(PUBLIC_DIR, name);
  fs.writeFileSync(filePath, minimalPNG);
  console.log(`✅ Created placeholder: ${name}`);
});

console.log('\n📋 Next steps:');
console.log('  1. Install ImageMagick: brew install imagemagick (macOS)');
console.log('  2. Run: npm run generate-splash-screens');
console.log('  3. Or manually create splash screens from "Extreme Logo.png"');
console.log('  4. Replace placeholder files in /public directory\n');

console.log('✅ Placeholder splash screens created - 404 errors prevented!');
