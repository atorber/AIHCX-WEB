import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 128];
const sourceIcon = path.join(__dirname, '../src/assets/icon.svg');
const outputDir = path.join(__dirname, '../dist');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 确保图标目录存在
const iconsDir = path.join(outputDir, 'assets/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 生成不同尺寸的图标
async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon${size}.png`);
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    // console.log(`Generated ${size}x${size} icon: ${outputPath}`);
  }
}

generateIcons().catch(console.error); 