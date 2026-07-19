import { writeFileSync, mkdirSync } from 'fs';
// Minimal valid 1×1 PNG, we note this is a placeholder
// A real OG image should be created by a designer
const PNG_1x1 = Buffer.from(
  '89504e470d0a1a0a0000000d494844520000000100000001080200000090' +
  '77533de0000000c4944415408d76360f8cfc00000000200016132128a000' +
  '00000049454e44ae426082',
  'hex'
);
mkdirSync('public', { recursive: true });
writeFileSync('public/og-image.png', PNG_1x1);
console.log('Created public/og-image.png placeholder');
