import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查源图标是否存在（从Vue版本复制）
const sourceIconPath = path.join(__dirname, '../../extension/src/assets/icons');
const targetIconPath = path.join(__dirname, '../src/assets/icons');

// 创建目标目录
if (!fs.existsSync(targetIconPath)) {
  fs.mkdirSync(targetIconPath, { recursive: true });
}

// 如果源图标存在，直接复制
if (fs.existsSync(sourceIconPath)) {
  const iconFiles = fs.readdirSync(sourceIconPath);
  iconFiles.forEach(file => {
    const sourcePath = path.join(sourceIconPath, file);
    const targetPath = path.join(targetIconPath, file);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`已复制图标: ${file}`);
  });
} else {
  console.log('源图标目录不存在，请手动创建图标文件');
}

console.log('图标生成/复制完成！');