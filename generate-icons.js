// Run with: node generate-icons.js
// Generates minimal SVG icons. Replace with real PNG icons before deploying.
const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

// Favicon SVG
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#080C14"/>
  <circle cx="16" cy="16" r="10" fill="none" stroke="#F0A500" stroke-width="2.5" stroke-dasharray="45 17" stroke-linecap="round"/>
  <circle cx="16" cy="16" r="4" fill="#F0A500"/>
</svg>`;

fs.writeFileSync(path.join(iconDir, 'favicon.svg'), favicon);
console.log('✓ favicon.svg generated');
console.log('⚠  For production, generate PNG icons (192x192 and 512x512) from the SVG.');
console.log('   Use: https://realfavicongenerator.net or pwa-asset-generator npm package');
