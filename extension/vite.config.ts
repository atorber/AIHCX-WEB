import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs'

export default defineConfig({
  plugins: [
    vue(),
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
        entryFileNames: '[name]/index.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})