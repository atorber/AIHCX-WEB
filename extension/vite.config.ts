import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import fs from 'fs'

// 复制 manifest.json 到 dist 目录
function copyManifest() {
  return {
    name: 'copy-manifest',
    buildEnd() {
      const manifestContent = fs.readFileSync(
        resolve(__dirname, 'src/manifest.json'),
        'utf-8'
      )
      fs.writeFileSync(
        resolve(__dirname, 'dist/manifest.json'),
        manifestContent
      )
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    {
      name: 'fix-html-paths',
      enforce: 'post',
      generateBundle(options, bundle) {
        // 修复HTML文件中的路径
        Object.keys(bundle).forEach((fileName) => {
          const chunk = bundle[fileName]
          if (chunk.type === 'asset' && fileName.endsWith('.html')) {
            let html = chunk.source.toString()
            
            // 修复脚本路径
            html = html.replace(/src="[^"]*\/([^/]+)\/index\.js"/, 'src="./index.js"')
            
            // 修复模块预加载路径
            html = html.replace(/href="[^"]*\/chunks\/([^"]+)"/, 'href="../chunks/$1"')
            
            // 修复样式表路径
            html = html.replace(/href="[^"]*\/content\/([^"]+)"/, 'href="../content/$1"')
            
            chunk.source = html
          }
        })
      }
    },
    {
      name: 'copy-manifest-and-resources',
      closeBundle() {
        // 复制manifest.json到dist目录
        copyFileSync(resolve(__dirname, 'manifest.json'), resolve(__dirname, 'dist/manifest.json'))
        
        // 复制vite.svg (作为图标使用)
        try {
          copyFileSync(resolve(__dirname, 'public/vite.svg'), resolve(__dirname, 'dist/vite.svg'))
        } catch (e) {
          console.error('复制vite.svg失败:', e)
        }
        
        // 如果有图标文件夹，也复制图标
        try {
          if (!existsSync(resolve(__dirname, 'dist/icons'))) {
            mkdirSync(resolve(__dirname, 'dist/icons'), { recursive: true })
          }
          const icons = readdirSync(resolve(__dirname, 'icons'))
          icons.forEach((icon: string) => {
            copyFileSync(resolve(__dirname, 'icons', icon), resolve(__dirname, 'dist/icons', icon))
          })
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

          // 确保content目录存在
          if (!existsSync(resolve(__dirname, 'dist/content'))) {
            mkdirSync(resolve(__dirname, 'dist/content'), { recursive: true })
          }

          // 创建空的content/index.css文件
          writeFileSync(resolve(__dirname, 'dist/content/index.css'), '')
        } catch (e) {
          console.error('复制文件失败:', e)
        }
      }
    },
    copyManifest()
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
        entryFileNames: '[name]/index.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          if (name.endsWith('.css')) {
            // 将所有CSS文件输出到content目录
            return 'content/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    // 禁用CSS代码分割
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})