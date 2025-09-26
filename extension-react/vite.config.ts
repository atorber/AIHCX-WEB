import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'fix-html-paths',
      enforce: 'post',
      generateBundle(options, bundle) {
        // 修复HTML文件中的路径
        Object.keys(bundle).forEach((fileName) => {
          const chunk = bundle[fileName]
          if (chunk.type === 'asset' && fileName.endsWith('.html')) {
            let html = chunk.source.toString()
            
            // 修复脚本路径并确保有type="module"
            html = html.replace(/src="[^"]*\/([^/]+)\/index\.js"/, 'src="./index.js"')
            
            // 确保script标签有且仅有一个type="module"
            html = html.replace(/<script([^>]*)>/g, (match, attrs) => {
              // 移除所有现有的type属性
              attrs = attrs.replace(/\s*type="[^"]*"/g, '')
              // 添加type="module"
              return `<script${attrs} type="module">`
            })
            
            // 修复模块预加载路径
            html = html.replace(/href="[^"]*\/chunks\/([^"]+)"/, 'href="../chunks/$1"')
            
            // 修复样式表路径，并添加sidebar.css
            if (fileName.includes('popup')) {
              html = html.replace(/href="[^"]*\/content\/([^"]+)"/, 'href="../content/$1"')
              // 添加sidebar.css引用
              html = html.replace('</head>', '  <link rel="stylesheet" href="./sidebar.css">\n</head>')
            } else {
              html = html.replace(/href="[^"]*\/content\/([^"]+)"/, 'href="../content/$1"')
            }
            
            chunk.source = html
          }
        })
      }
    },
    {
      name: 'copy-manifest-and-resources',
      closeBundle() {
        // 确保dist目录存在
        if (!existsSync(resolve(__dirname, 'dist'))) {
          mkdirSync(resolve(__dirname, 'dist'), { recursive: true })
        }
        
        // 复制manifest.json到dist目录
        copyFileSync(resolve(__dirname, 'src/manifest.json'), resolve(__dirname, 'dist/manifest.json'))
        
        // 复制图标
        try {
          if (!existsSync(resolve(__dirname, 'dist/assets/icons'))) {
            mkdirSync(resolve(__dirname, 'dist/assets/icons'), { recursive: true })
          }
          
          // 复制来源图标文件 - 从Vue版本复制
          const sourceIconPath = resolve(__dirname, '../extension/src/assets/icons')
          if (existsSync(sourceIconPath)) {
            const icons = readdirSync(sourceIconPath)
            icons.forEach((icon: string) => {
              copyFileSync(
                resolve(sourceIconPath, icon),
                resolve(__dirname, 'dist/assets/icons', icon)
              )
            })
          }
        } catch (e) {
          console.error('复制图标文件失败:', e)
        }

        // 复制HTML文件到正确的位置
        try {
          // 复制options页面
          if (existsSync(resolve(__dirname, 'dist/src/options/index.html'))) {
            if (!existsSync(resolve(__dirname, 'dist/options'))) {
              mkdirSync(resolve(__dirname, 'dist/options'), { recursive: true })
            }
            copyFileSync(
              resolve(__dirname, 'dist/src/options/index.html'),
              resolve(__dirname, 'dist/options/index.html')
            )
          }

          // 复制popup页面
          if (existsSync(resolve(__dirname, 'dist/src/popup/index.html'))) {
            if (!existsSync(resolve(__dirname, 'dist/popup'))) {
              mkdirSync(resolve(__dirname, 'dist/popup'), { recursive: true })
            }
            copyFileSync(
              resolve(__dirname, 'dist/src/popup/index.html'),
              resolve(__dirname, 'dist/popup/index.html')
            )
          }
          
          // 复制sidebar.css到popup目录
          if (existsSync(resolve(__dirname, 'src/popup/sidebar.css'))) {
            if (!existsSync(resolve(__dirname, 'dist/popup'))) {
              mkdirSync(resolve(__dirname, 'dist/popup'), { recursive: true })
            }
            copyFileSync(
              resolve(__dirname, 'src/popup/sidebar.css'),
              resolve(__dirname, 'dist/popup/sidebar.css')
            )
          }

          // 确保content目录存在
          if (!existsSync(resolve(__dirname, 'dist/content'))) {
            mkdirSync(resolve(__dirname, 'dist/content'), { recursive: true })
          }

          // 复制content样式文件
          if (existsSync(resolve(__dirname, 'src/content/style.css'))) {
            copyFileSync(
              resolve(__dirname, 'src/content/style.css'),
              resolve(__dirname, 'dist/content/style.css')
            )
          }

          // 创建空的content/index.css文件
          writeFileSync(resolve(__dirname, 'dist/content/index.css'), '')
        } catch (e) {
          console.error('复制文件失败:', e)
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        popup: './src/popup/index.html',
        options: './src/options/index.html',
        background: './src/background/index.ts',
        content: './src/content/index.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // background script 需要单独处理
          if (chunkInfo.name === 'background') {
            return 'background/index.js'
          }
          return '[name]/index.js'
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          if (name.endsWith('.css')) {
            // 将所有CSS文件输出到content目录
            return 'content/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        format: 'es'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext', // Chrome扩展支持现代ES特性
    minify: false, // 关闭压缩以便调试
    // 禁用CSS代码分割
    cssCodeSplit: false,
    // 减小chunk大小警告阈值
    chunkSizeWarningLimit: 600,
    // 确保所有依赖都被打包
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})