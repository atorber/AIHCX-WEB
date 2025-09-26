#!/bin/bash

# AIHC助手 React版本构建验证脚本

echo "🚀 开始构建验证..."

# 检查Node.js版本
echo "📋 检查环境..."
node --version
npm --version

# 安装依赖
echo "📦 安装依赖..."
npm install

# 类型检查
echo "🔍 进行TypeScript类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript类型检查失败"
    exit 1
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

# 检查构建产物
echo "✅ 检查构建产物..."
if [ ! -d "dist" ]; then
    echo "❌ dist目录不存在"
    exit 1
fi

if [ ! -f "dist/manifest.json" ]; then
    echo "❌ manifest.json文件不存在"
    exit 1
fi

if [ ! -f "dist/popup/index.html" ]; then
    echo "❌ popup/index.html文件不存在"
    exit 1
fi

if [ ! -f "dist/options/index.html" ]; then
    echo "❌ options/index.html文件不存在"
    exit 1
fi

if [ ! -f "dist/background/index.js" ]; then
    echo "❌ background/index.js文件不存在"
    exit 1
fi

if [ ! -f "dist/content/index.js" ]; then
    echo "❌ content/index.js文件不存在"
    exit 1
fi

echo "🎉 构建验证成功！"
echo ""
echo "📋 构建产物包含："
echo "   - manifest.json (扩展清单文件)"
echo "   - popup/ (弹窗页面)"
echo "   - options/ (设置页面)"
echo "   - background/ (后台脚本)"
echo "   - content/ (内容脚本)"
echo "   - assets/ (静态资源)"
echo ""
echo "🔧 安装方法："
echo "   1. 在Chrome中打开 chrome://extensions/"
echo "   2. 开启开发者模式"
echo "   3. 点击'加载已解压的扩展程序'"
echo "   4. 选择 dist 文件夹"
echo ""
echo "✨ React版本重构完成！"