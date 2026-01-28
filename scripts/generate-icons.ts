/**
 * Icon Generation Script
 * 
 * Generates all required PWA and favicon icons from Extreme Logo.png
 * 
 * Requirements:
 * - ImageMagick installed: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)
 * - Or use Sharp: npm install sharp
 * 
 * Run: npm run generate-icons
 * Or: npx tsx scripts/generate-icons.ts
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const PUBLIC_DIR = join(process.cwd(), 'public');
const LOGO_PATH = join(PUBLIC_DIR, 'Extreme Logo.png');

interface IconConfig {
  name: string;
  size: number;
  purpose?: 'any' | 'maskable';
}

const ICONS: IconConfig[] = [
  // Apple Touch Icons (iOS)
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 },
  { name: 'apple-touch-icon-76x76.png', size: 76 },
  
  // Favicons
  { name: 'favicon.ico', size: 32 }, // ICO format (multi-size)
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-96x96.png', size: 96 },
  
  // PWA Icons
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-maskable-192x192.png', size: 192, purpose: 'maskable' },
  { name: 'icon-maskable-512x512.png', size: 512, purpose: 'maskable' },
];

function checkImageMagick(): boolean {
  try {
    execSync('which convert', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkSharp(): boolean {
  try {
    require.resolve('sharp');
    return true;
  } catch {
    return false;
  }
}

function generateWithImageMagick(input: string, output: string, size: number): void {
  const outputPath = join(PUBLIC_DIR, output);
  
  // For ICO, create multiple sizes
  if (output.endsWith('.ico')) {
    execSync(
      `convert "${input}" -resize 16x16 -define icon:auto-resize=16,32,48 "${outputPath}"`,
      { stdio: 'inherit' }
    );
  } else {
    // For PNG, resize with padding to maintain square aspect ratio
    execSync(
      `convert "${input}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${outputPath}"`,
      { stdio: 'inherit' }
    );
  }
  
  console.log(`✅ Generated: ${output} (${size}x${size})`);
}

function generateWithSharp(input: string, output: string, size: number): void {
  const sharp = require('sharp');
  const outputPath = join(PUBLIC_DIR, output);
  
  if (output.endsWith('.ico')) {
    // Sharp doesn't support ICO directly, generate PNG and convert
    const pngPath = outputPath.replace('.ico', '.png');
    sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(pngPath)
      .then(() => {
        console.log(`✅ Generated: ${output.replace('.ico', '.png')} (${size}x${size})`);
        console.log(`⚠️  Note: ICO conversion requires ImageMagick. PNG created instead.`);
      });
  } else {
    sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath)
      .then(() => {
        console.log(`✅ Generated: ${output} (${size}x${size})`);
      });
  }
}

function main(): void {
  console.log('🎨 Icon Generation Script\n');
  
  // Check if logo exists
  if (!existsSync(LOGO_PATH)) {
    console.error(`❌ Logo not found: ${LOGO_PATH}`);
    console.error('   Please ensure "Extreme Logo.png" exists in /public directory');
    process.exit(1);
  }
  
  console.log(`📁 Source logo: ${LOGO_PATH}\n`);
  
  // Check for image processing tools
  const hasImageMagick = checkImageMagick();
  const hasSharp = checkSharp();
  
  if (!hasImageMagick && !hasSharp) {
    console.error('❌ No image processing tool found!');
    console.error('\nPlease install one of the following:');
    console.error('  Option 1 (Recommended): ImageMagick');
    console.error('    macOS: brew install imagemagick');
    console.error('    Linux: sudo apt-get install imagemagick');
    console.error('    Windows: https://imagemagick.org/script/download.php');
    console.error('\n  Option 2: Sharp (Node.js)');
    console.error('    npm install sharp');
    process.exit(1);
  }
  
  const tool = hasImageMagick ? 'ImageMagick' : 'Sharp';
  console.log(`✅ Using: ${tool}\n`);
  
  // Generate all icons
  console.log('Generating icons...\n');
  
  for (const icon of ICONS) {
    try {
      if (hasImageMagick) {
        generateWithImageMagick(LOGO_PATH, icon.name, icon.size);
      } else {
        generateWithSharp(LOGO_PATH, icon.name, icon.size);
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error);
    }
  }
  
  console.log('\n✅ Icon generation complete!');
  console.log('\n📋 Next steps:');
  console.log('  1. Verify icons in /public directory');
  console.log('  2. Test on iOS device (add to home screen)');
  console.log('  3. Check browser DevTools → Application → Manifest');
  console.log('  4. Run: npm run build (to verify no 404 errors)');
}

if (require.main === module) {
  main();
}

export { ICONS, generateWithImageMagick, generateWithSharp };
