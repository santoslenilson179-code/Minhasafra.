const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Brand colors
const COLOR_FOREST = '#14251C';
const COLOR_MATA = '#20382A';

// SVG with Minha Safra official emblem and brand background
function getSvg(isMaskable = false) {
  // Inner symbol scale: 0.80 for maskable and iOS safe zone, 0.88 for standard any
  const scale = isMaskable ? 0.78 : 0.86;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${COLOR_FOREST}"/>
      <stop offset="100%" stop-color="${COLOR_MATA}"/>
    </linearGradient>
    <linearGradient id="leafGrad" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#81c784"/>
      <stop offset="100%" stop-color="#c8e6c9"/>
    </linearGradient>
  </defs>
  <!-- Full bleed background for PWA maskable / iOS icons -->
  <rect width="512" height="512" fill="url(#bg)" />
  
  <!-- Centered symbol with safe-zone margin -->
  <g transform="translate(256, 256) scale(${scale}) translate(-256, -256)">
    <!-- Soil base arc -->
    <ellipse cx="256" cy="400" rx="140" ry="24" fill="#a1887f" opacity="0.65" />
    
    <!-- Plant stem -->
    <path d="M256 400 C256 310, 252 230, 256 160" stroke="#c8e6c9" stroke-width="20" stroke-linecap="round" fill="none" />
    
    <!-- Left Leaf -->
    <path d="M256 300 C170 290, 130 210, 150 150 C210 150, 250 220, 256 300 Z" fill="url(#leafGrad)" />
    
    <!-- Right Leaf -->
    <path d="M256 240 C340 230, 380 150, 360 90 C300 90, 260 160, 256 240 Z" fill="#a5d6a7" />

    <!-- Center Sun Sparkle / Droplet -->
    <circle cx="256" cy="120" r="16" fill="#fff59d" />
  </g>
</svg>`;
}

async function generate() {
  const publicDir = path.resolve(__dirname, '../public');

  const standardSvg = Buffer.from(getSvg(false));
  const maskableSvg = Buffer.from(getSvg(true));

  // 1. pwa-192x192.png (purpose: any)
  await sharp(standardSvg)
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ Generated pwa-192x192.png');

  // 2. pwa-512x512.png (purpose: any)
  await sharp(standardSvg)
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ Generated pwa-512x512.png');

  // 3. pwa-maskable-192x192.png (purpose: maskable)
  await sharp(maskableSvg)
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-192x192.png'));
  console.log('✓ Generated pwa-maskable-192x192.png');

  // 4. pwa-maskable-512x512.png (purpose: maskable)
  await sharp(maskableSvg)
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ Generated pwa-maskable-512x512.png');

  // 5. apple-touch-icon.png (180x180, iOS Safari)
  await sharp(maskableSvg)
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');

  // 6. favicon.png (32x32)
  await sharp(standardSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Generated favicon.png');

  // 7. Update icon.svg
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), getSvg(false), 'utf8');
  console.log('✓ Updated icon.svg');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
