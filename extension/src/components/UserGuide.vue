<template>
  <div v-if="showGuide" class="user-guide-overlay">
    <div class="user-guide">
      <div class="guide-header">
        <h3>🎉 欢迎使用 AIHC助手</h3>
        <button class="close-btn" @click="closeGuide">×</button>
      </div>
      
      <div class="guide-content">
        <div class="guide-step" v-for="(step, index) in guideSteps" :key="index">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h4>{{ step.title }}</h4>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="guide-footer">
        <label class="checkbox-label">
          <input type="checkbox" v-model="dontShowAgain">
          <span>不再显示此向导</span>
        </label>
        <button class="guide-btn primary" @click="closeGuide">开始使用</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showGuide = ref(false)
const dontShowAgain = ref(false)

const guideSteps = [
  {
    title: '支持页面检测',
    description: '插件会自动检测您是否在AIHC控制台的支持页面，并显示相应功能'
  },
  {
    title: 'CLI命令生成',
    description: '在任务详情页可以生成创建任务的CLI命令，方便本地使用'
  },
  {
    title: '参数导出',
    description: '支持将任务参数导出为JSON、YAML格式，便于备份和修改'
  },
  {
    title: '快速复制',
    description: '一键复制命令或参数到剪贴板，提高工作效率'
  }
]

// Chrome API 类型定义
declare const chrome: {
  storage: {
    sync: {
      get: (keys: string[], callback: (result: Record<string, any>) => void) => void;
      set: (items: Record<string, any>, callback?: () => void) => void;
    }
  }
}

onMounted(() => {
  // 检查是否显示用户引导
  chrome.storage.sync.get(['hideUserGuide'], (result) => {
    if (!result.hideUserGuide) {
      showGuide.value = true
    }
  })
})

const closeGuide = () => {
  showGuide.value = false
  
  if (dontShowAgain.value) {
    chrome.storage.sync.set({ hideUserGuide: true })
  }
}
</script>

<style scoped>
.user-guide-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 10001 !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
}

.user-guide {
  background: white !important;
  border-radius: 12px !important;
  width: 90% !important;
  max-width: 420px !important;
  max-height: 520px !important;
  overflow-y: auto !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
  margin: 20px !important;
}

.guide-header {
  padding: 20px 20px 10px !important;
  border-bottom: 1px solid #eee !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%) !important;
  color: white !important;
  border-radius: 12px 12px 0 0 !important;
}

.guide-header h3 {
  margin: 0 !important;
  color: white !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}

.close-btn {
  background: none !important;
  border: none !important;
  font-size: 24px !important;
  cursor: pointer !important;
  color: white !important;
  padding: 0 !important;
  width: 30px !important;
  height: 30px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background-color 0.2s !important;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.guide-content {
  padding: 24px !important;
}

.guide-step {
  display: flex !important;
  margin-bottom: 20px !important;
  align-items: flex-start !important;
  gap: 15px !important;
}

.guide-step:last-child {
  margin-bottom: 0 !important;
}

.step-number {
  width: 28px !important;
  height: 28px !important;
  background: #4285f4 !important;
  color: white !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 13px !important;
  font-weight: bold !important;
  flex-shrink: 0 !important;
  box-shadow: 0 2px 4px rgba(66, 133, 244, 0.3) !important;
}

.step-content h4 {
  margin: 0 0 8px 0 !important;
  color: #333 !important;
  font-size: 15px !important;
  font-weight: 600 !important;
}

.step-content p {
  margin: 0 !important;
  color: #666 !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
}

.guide-footer {
  padding: 20px 24px !important;
  border-top: 1px solid #eee !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  background: #f8f9fa !important;
  border-radius: 0 0 12px 12px !important;
}

.checkbox-label {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 13px !important;
  color: #666 !important;
  cursor: pointer !important;
}

.checkbox-label input {
  margin: 0 !important;
  accent-color: #4285f4 !important;
}

.guide-btn {
  padding: 10px 24px !important;
  border: none !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

.guide-btn.primary {
  background: #4285f4 !important;
  color: white !important;
}

.guide-btn.primary:hover {
  background: #3367d6 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3) !important;
}

.guide-btn.primary:active {
  transform: translateY(0) !important;
}
</style>