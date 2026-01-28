/**
 * Splash Screen Generation Script
 * 
 * Generates iOS splash screens for all device sizes from Extreme Logo.png
 * 
 * Requirements:
 * - ImageMagick installed: brew install imagemagick (macOS)
 * 
 * Run: npm run generate-splash-screens
 * Or: npx tsx scripts/generate-splash-screens.ts
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const PUBLIC_DIR = join(process.cwd(), 'public');
const LOGO_PATH = join(PUBLIC_DIR, 'Extreme Logo.png');

interface SplashScreenConfig {
  name: string;
  width: number;
  height: number;
  device: string;
}

const SPLASH_SCREENS: SplashScreenConfig[] = [
  // iPhone 14 Pro Max / 13 Pro Max / 12 Pro Max
  { name: 'splash-iphone-14-pro-max.png', width: 1290, height: 2796, device: 'iPhone 14 Pro Max' },
  // iPhone 14 Plus / 13 / 12
  { name: 'splash-iphone-14-plus.png', width: 1284, height: 2778, device: 'iPhone 14 Plus' },
  // iPhone 14 / 13 mini / 12 mini
  { name: 'splash-iphone-14.png', width: 1170, height: 2532, device: 'iPhone 14' },
  // iPhone 11 Pro Max / XS Max
  { name: 'splash-iphone-11-pro-max.png', width: 1242, height: 2688, device: 'iPhone 11 Pro Max' },
  // iPhone 11 / XR
  { name: 'splash-iphone-11.png', width: 828, height: 1792, device: 'iPhone 11' },
  // iPhone 8 Plus / 7 Plus / 6s Plus
  { name: 'splash-iphone-8-plus.png', width: 1242, height: 2208, device: 'iPhone 8 Plus' },
  // iPhone 8 / 7 / 6s / SE 2nd gen
  { name: 'splash-iphone-8.png', width: 750, height: 1334, device: 'iPhone 8' },
  // iPad Pro 12.9"
  { name: 'splash-ipad-pro-12-9.png', width: 2048, height: 2732, device: 'iPad Pro 12.9"' },
  // iPad Pro 11"
  { name: 'splash-ipad-pro-11.png', width: 1668, height: 2388, device: 'iPad Pro 11"' },
  // iPad Air / Mini
  { name: 'splash-ipad.png', width: 1536, height: 2048, device: 'iPad' },
];

function checkImageMagick(): boolean {
  try {
    execSync('which convert', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function generateSplashScreen(input: string, output: string, width: number, height: number, bgColor: string = '#F5F1E8'): void {
  const outputPath = join(PUBLIC_DIR, output);
  
  // Create splash screen: logo centered on background color
  // Splash screens should fill entire screen with background color, logo centered
  execSync(
    `convert "${input}" -resize ${Math.min(width, height) * 0.4}x${Math.min(width, height) * 0.4} -background "${bgColor}" -gravity center -extent ${width}x${height} "${outputPath}"`,
    { stdio: 'inherit' }
  );
  
  console.log(`✅ Generated: ${output} (${width}x${height})`);
}

function main(): void {
  console.log('🎨 Splash Screen Generation Script\n');
  
  // Check if logo exists
  if (!existsSync(LOGO_PATH)) {
    console.error(`❌ Logo not found: ${LOGO_PATH}`);
    console.error('   Please ensure "Extreme Logo.png" exists in /public directory');
    process.exit(1);
  }
  
  console.log(`📁 Source logo: ${LOGO_PATH}\n`);
  
  // Check for ImageMagick
  if (!checkImageMagick()) {
    console.error('❌ ImageMagick not found!');
    console.error('\nPlease install ImageMagick:');
    console.error('  macOS: brew install imagemagick');
    console.error('  Linux: sudo apt-get install imagemagick');
    console.error('  Windows: https://imagemagick.org/script/download.php');
    process.exit(1);
  }
  
  console.log('✅ ImageMagick found\n');
  
  // Generate all splash screens
  console.log('Generating splash screens...\n');
  
  const bgColor = '#F5F1E8'; // Match manifest background_color
  
  for (const splash of SPLASH_SCREENS) {
    try {
      generateSplashScreen(LOGO_PATH, splash.name, splash.width, splash.height, bgColor);
    } catch (error) {
      console.error(`❌ Failed to generate ${splash.name}:`, error);
    }
  }
  
  console.log('\n✅ Splash screen generation complete!');
  console.log('\n📋 Next steps:');
  console.log('  1. Verify splash screens in /public directory');
  console.log('  2. Test on iOS device (add to home screen)');
  console.log('  3. Check splash screen appears correctly on app launch');
}

if (require.main === module) {
  main();
}

export { SPLASH_SCREENS, generateSplashScreen };
