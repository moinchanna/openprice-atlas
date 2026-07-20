// scripts/generate-og-image.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Define image dimensions
const width = 1200;
const height = 630;

// Create a base image with dark background
const base = sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 10, g: 10, b: 10, alpha: 1 }, // #0A0A0A
  },
});

// Define text overlay using SVG for crisp rendering
const svgText = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { fill: #FAFAFA; font-size: 80px; font-weight: 700; font-family: 'Space Mono', monospace; }
    .subtitle { fill: #EF4444; font-size: 36px; font-weight: 600; font-family: 'Space Mono', monospace; }
    .tagline { fill: #D4D4D4; font-size: 28px; font-weight: 400; font-family: 'Space Mono', monospace; }
  </style>
  <text x="50%" y="40%" text-anchor="middle" class="title">OPENPRICE ATLAS</text>
  <text x="50%" y="55%" text-anchor="middle" class="subtitle">Fair regional pricing for SaaS</text>
  <text x="50%" y="70%" text-anchor="middle" class="tagline">190+ markets • World Bank data • Free &amp; Open Source</text>
</svg>`;

(async () => {
  try {
    const outputPath = path.resolve('public', 'og-image.png');
    await base
      .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
      .png()
      .toFile(outputPath);
    console.log('OG image generated at', outputPath);
  } catch (err) {
    console.error('Error generating OG image:', err);
    process.exit(1);
  }
})();
