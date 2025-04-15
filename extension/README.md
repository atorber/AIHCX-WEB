# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## 安装插件

1. 解压缩插件到本地磁盘

2. Chrome浏览器中打开 管理拓展程序>加载已解压的拓展程序

## 浏览器插件开发指南

### 环境准备

1. 确保安装了 Node.js（推荐使用 v18 或更高版本）
2. 克隆仓库到本地
   ```bash
   git clone <仓库地址>
   cd extension
   ```
3. 安装依赖
   ```bash
   npm install
   ```

### 开发调试

1. 启动开发服务器（支持热重载）
   ```bash
   npm run dev
   ```
   该命令会监听文件变化并自动重新构建项目

2. 在浏览器中加载插件
   - 打开 Chrome 浏览器，进入 `chrome://extensions/` 页面
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目目录中的 `dist` 文件夹

3. 调试技巧
   - 点击扩展图标可以打开弹出窗口(popup)
   - 右键点击扩展图标，选择"选项"可以打开设置页面
   - 对于 background script，可在扩展管理页面点击"查看背景页"进行调试
   - 对于 content script，可在页面上右键选择"检查"打开开发者工具

4. 当你修改代码后，扩展会自动重新构建，但你需要在 `chrome://extensions/` 页面点击刷新按钮来重新加载扩展

### 编译打包

1. 构建生产版本
   ```bash
   npm run build
   ```
   
2. 打包文件位于 `dist` 目录，可以:
   - 用于开发测试：直接加载已解压的扩展程序
   - 发布到 Chrome 网上应用店：将 `dist` 目录压缩成 ZIP 文件并上传

3. 发布注意事项
   - 确保 `manifest.json` 中的版本号已更新
   - 编辑 `manifest.json` 中的描述和权限，确保符合你的需求
   - 参考 [Chrome 开发者文档](https://developer.chrome.com/docs/webstore/publish) 了解发布流程

### 项目结构说明

- `src/popup`: 扩展弹出窗口相关代码
- `src/options`: 扩展选项页面相关代码
- `src/background`: 后台脚本
- `src/content`: 内容脚本（注入到页面中）
- `src/components`: 公共组件
- `src/utils`: 工具函数
- `src/types`: TypeScript 类型定义
- `src/assets`: 静态资源文件
- `content/`: 内容脚本目录
- `background/`: 后台脚本目录
- `icons/`: 扩展图标资源
- `scripts/`: 构建脚本
- `public/`: 公共资源目录
- `manifest.json`: 扩展配置文件
- `vite.config.ts`: Vite构建配置
- `tsconfig.json`: TypeScript 配置文件

## 打包程.crx

```
/Users/luyuchao/Documents/GitHub/AIHCX-WEB/extension/dist.pem

/Users/luyuchao/Documents/GitHub/AIHCX-WEB/extension/dist.crx
```

## 更新日志

### 0.1.3

- 修复样式影响其他网站问题
- 限定插件仅在百度云控制台生效
