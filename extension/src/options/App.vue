<template>
  <div class="options-container">
    <h1>{{ title }}</h1>
    <div class="options-form">
      <div class="form-group">
        <label for="ak">百度云 Access Key</label>
        <input type="text" id="ak" v-model="settings.ak" placeholder="请输入百度云Access Key" />
      </div>
      <div class="form-group">
        <label for="sk">百度云 Secret Key</label>
        <input type="password" id="sk" v-model="settings.sk" placeholder="请输入百度云Secret Key" />
      </div>
      <div class="form-group">
        <label for="region">区域</label>
        <select id="region" v-model="settings.region">
          <option value="" disabled>请选择区域</option>
          <option value="bj">华北-北京</option>
          <option value="bd">华北-保定</option>
          <option value="yq">华北-阳泉</option>
          <option value="gz">华南-广州</option>
          <option value="su">华东-苏州</option>
          <option value="fwh">华中-武汉</option>
        </select>
      </div>
      <button @click="saveSettings">保存设置</button>
      <div v-if="saveStatus" class="status-message" :class="saveStatus.type">
        {{ saveStatus.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 确保Chrome API类型可用
declare const chrome: {
  storage: {
    sync: {
      get: (keys: string[], callback: (result: Record<string, any>) => void) => void;
      set: (items: Record<string, any>, callback?: () => void) => void;
    }
  }
}

const title = ref('AIHC助手设置')
const settings = ref({
  ak: '',
  sk: '',
  region: 'bj'
})

const saveStatus = ref<{type: string, message: string} | null>(null)

onMounted(() => {
  // 从Chrome存储加载设置
  chrome.storage.sync.get(['ak', 'sk', 'region'], (result) => {
    settings.value.ak = result.ak || ''
    settings.value.sk = result.sk || ''
    settings.value.region = result.region || ''
  })
})

const saveSettings = () => {
  // 验证必填字段
  if (!settings.value.ak || !settings.value.sk) {
    saveStatus.value = {
      type: 'error',
      message: '百度云Access Key和Secret Key为必填项'
    }
    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
    return
  }

  // 保存设置到Chrome存储
  chrome.storage.sync.set({
    ak: settings.value.ak,
    sk: settings.value.sk,
    region: settings.value.region
  }, () => {
    saveStatus.value = {
      type: 'success',
      message: '设置已保存'
    }
    console.log('设置已保存', settings.value)
    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
  })
}
</script>

<style scoped>
.options-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.options-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.options-form button {
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.options-form button:hover {
  background-color: #3367d6;
  color: white;
}

.status-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
