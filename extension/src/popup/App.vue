<template>
  <div class="popup-container">
    <div class="header">
      <h1>AIHCX 助手</h1>
      <div class="tabs">
        <button :class="{ active: activeTab === 'task-params' }" @click="activeTab = 'task-params'">参数生成</button>
        <button :class="{ active: activeTab === 'task-manage' }" @click="activeTab = 'task-manage'">任务管理</button>
      </div>
    </div>

    <!-- 参数生成选项卡 -->
    <div v-if="activeTab === 'task-params'" class="tab-content">
      <div class="form-group">
        <label>任务类型</label>
        <select v-model="taskParams.type">
          <option value="ocr">文字识别 (OCR)</option>
          <option value="classification">图像分类</option>
          <option value="detection">目标检测</option>
          <option value="segmentation">图像分割</option>
          <option value="custom">自定义</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>数据来源</label>
        <select v-model="taskParams.dataSource">
          <option value="local">本地文件</option>
          <option value="remote">远程URL</option>
          <option value="database">数据库</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>处理优先级</label>
        <select v-model="taskParams.priority">
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>
      
      <div v-if="taskParams.type === 'custom'" class="form-group">
        <label>自定义参数 (JSON)</label>
        <textarea v-model="taskParams.customParams" rows="4" placeholder='{"key": "value"}'></textarea>
      </div>
      
      <div class="form-actions">
        <button @click="generateParams" :disabled="!isConfigured">生成参数</button>
        <button @click="createTask" :disabled="!isConfigured || !taskParams.generated">创建任务</button>
      </div>
      
      <div v-if="!isConfigured" class="warning-message">
        请先在选项页中配置百度云 AK/SK
        <button @click="openOptions" class="link-button">前往设置</button>
      </div>
      
      <div v-if="taskParams.generated" class="result-container">
        <h3>生成的参数</h3>
        <pre>{{ taskParams.generated }}</pre>
        <button @click="copyToClipboard">复制</button>
      </div>
      
      <div v-if="message" class="message" :class="message.type">
        {{ message.text }}
      </div>
    </div>

    <!-- 任务管理选项卡 -->
    <div v-if="activeTab === 'task-manage'" class="tab-content">
      <div class="task-list-actions">
        <button @click="refreshTasks" :disabled="!isConfigured">刷新任务列表</button>
      </div>
      
      <div v-if="!isConfigured" class="warning-message">
        请先在选项页中配置百度云 AK/SK
        <button @click="openOptions" class="link-button">前往设置</button>
      </div>
      
      <div v-if="loading" class="loading">
        加载中...
      </div>
      
      <div v-else-if="taskList.length === 0 && isConfigured" class="empty-list">
        暂无任务数据
      </div>
      
      <div v-else-if="isConfigured" class="task-list">
        <div v-for="(task, index) in taskList" :key="index" class="task-item">
          <div class="task-info">
            <div class="task-title">任务ID: {{ task.id }}</div>
            <div class="task-type">类型: {{ task.type }}</div>
            <div class="task-status" :class="task.status">状态: {{ getStatusText(task.status) }}</div>
            <div class="task-date">创建时间: {{ formatDate(task.createdAt) }}</div>
          </div>
          <div class="task-actions">
            <button @click="viewTaskDetail(task)" class="action-button">查看</button>
            <button 
              v-if="!['completed', 'failed', 'cancelled'].includes(task.status)" 
              @click="cancelTask(task.id)" 
              class="action-button cancel">
              取消
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="selectedTask" class="task-detail-overlay">
        <div class="task-detail">
          <button @click="selectedTask = null" class="close-button">×</button>
          <h3>任务详情</h3>
          <div class="detail-content">
            <div class="detail-item">
              <strong>任务ID:</strong> {{ selectedTask.id }}
            </div>
            <div class="detail-item">
              <strong>类型:</strong> {{ selectedTask.type }}
            </div>
            <div class="detail-item">
              <strong>状态:</strong> 
              <span :class="selectedTask.status">{{ getStatusText(selectedTask.status) }}</span>
            </div>
            <div class="detail-item">
              <strong>创建时间:</strong> {{ formatDate(selectedTask.createdAt) }}
            </div>
            <div v-if="selectedTask.completedAt" class="detail-item">
              <strong>完成时间:</strong> {{ formatDate(selectedTask.completedAt) }}
            </div>
            <div class="detail-item">
              <strong>参数:</strong>
              <pre>{{ JSON.stringify(selectedTask.params, null, 2) }}</pre>
            </div>
            <div v-if="selectedTask.result" class="detail-item">
              <strong>结果:</strong>
              <pre>{{ JSON.stringify(selectedTask.result, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { DescribeResourcePools } from '../utils/resourcePools'

// Chrome API 类型定义
declare const chrome: {
  runtime: {
    sendMessage: (message: any, callback?: (response: any) => void) => void;
    openOptionsPage: () => void;
  },
  storage: {
    sync: {
      get: (keys: string[], callback: (result: Record<string, any>) => void) => void;
    }
  }
}

// 定义任务类型
interface Task {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  params: Record<string, any>;
  result?: Record<string, any>;
}

// 状态
const activeTab = ref('task-params')
const isConfigured = ref(false)
const selectedTask = ref<Task | null>(null)
const loading = ref(false)
const message = ref<{ type: string, text: string } | null>(null)

// 资源池列表
const resourcePools = ref<any[]>([])

// 获取资源池列表
const getResourcePools = async () => {
  console.log('获取资源池列表')
  console.log(chrome.storage.sync)
  try {
    // 将Chrome回调API转为Promise
    const result = await new Promise<{ak?: string, sk?: string, region?: string}>(resolve => {
      chrome.storage.sync.get(['ak', 'sk', 'region'], resolve);
    });
    
    if (!result.ak || !result.sk) {
      throw new Error('未配置凭证');
    }
    
    const pools = await DescribeResourcePools(result.ak, result.sk, result.region || 'bj');
    resourcePools.value = pools;
  } catch (error) {
    console.error('getResourcePools获取资源池失败:', error);
  }
}

getResourcePools()

console.log(resourcePools.value)

// 任务列表
const taskList = ref<Task[]>([])

// 检查配置状态
onMounted(() => {
  checkConfiguration()
  
  // 当切换到任务管理标签时加载任务列表
  if (activeTab.value === 'task-manage') {
    refreshTasks()
  }
})

const checkConfiguration = () => {
  chrome.storage.sync.get(['ak', 'sk'], (result) => {
    isConfigured.value = !!(result.ak && result.sk)
  })
}

// 任务参数
const taskParams = reactive({
  type: 'ocr',
  dataSource: 'local',
  priority: 'medium',
  customParams: '',
  generated: ''
})

// 功能方法
const openOptions = () => {
  chrome.runtime.openOptionsPage()
}

const generateParams = () => {
  // 准备要发送的数据
  const data = {
    type: taskParams.type,
    dataSource: taskParams.dataSource,
    priority: taskParams.priority
  }
  
  if (taskParams.type === 'custom' && taskParams.customParams) {
    try {
      const customParams = JSON.parse(taskParams.customParams)
      Object.assign(data, { custom: customParams })
    } catch (e) {
      showMessage('error', '自定义参数JSON格式不正确')
      return
    }
  }
  
  // 发送消息到background script
  loading.value = true
  chrome.runtime.sendMessage(
    { action: 'generateParams', data },
    (response) => {
      loading.value = false
      if (response && response.success) {
        taskParams.generated = JSON.stringify(response.params, null, 2)
      } else {
        showMessage('error', response?.error || '生成参数失败')
      }
    }
  )
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(taskParams.generated)
    .then(() => {
      showMessage('success', '已复制到剪贴板')
    })
    .catch(err => {
      console.error('无法复制文本: ', err)
      showMessage('error', '复制失败')
    })
}

const createTask = () => {
  if (!taskParams.generated) {
    showMessage('error', '请先生成参数')
    return
  }
  
  try {
    const data = JSON.parse(taskParams.generated)
    
    loading.value = true
    chrome.runtime.sendMessage(
      { action: 'createTask', data },
      (response) => {
        loading.value = false
        if (response && response.success) {
          showMessage('success', response.message || '任务创建成功')
          // 清空生成的参数
          taskParams.generated = ''
          
          // 如果在任务管理标签页，刷新任务列表
          if (activeTab.value === 'task-manage') {
            refreshTasks()
          }
        } else {
          showMessage('error', response?.error || '创建任务失败')
        }
      }
    )
  } catch (e) {
    showMessage('error', '参数格式错误')
  }
}

const refreshTasks = () => {
  loading.value = true

  // 先获取资源池列表，然后再获取任务列表
  getResourcePools().then(() => {
    chrome.runtime.sendMessage(
      { action: 'getTasks' },
      (response) => {
        loading.value = false
        if (response && response.success) {
          taskList.value = response.tasks || []
        } else {
          showMessage('error', response?.error || '获取任务列表失败')
        }
      }
    )
  }).catch(error => {
    loading.value = false
    console.error('刷新任务列表，获取资源池失败:', error)
    showMessage('error', '获取资源池失败')
  })
}

const viewTaskDetail = (task: Task) => {
  selectedTask.value = task
}

const cancelTask = (taskId: string) => {
  loading.value = true
  chrome.runtime.sendMessage(
    { action: 'cancelTask', taskId },
    (response) => {
      loading.value = false
      if (response && response.success) {
        showMessage('success', response.message || '任务已取消')
        refreshTasks()
      } else {
        showMessage('error', response?.error || '取消任务失败')
      }
    }
  )
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '等待中',
    'processing': '处理中',
    'completed': '已完成',
    'failed': '失败',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const showMessage = (type: 'success' | 'error', text: string) => {
  message.value = { type, text }
  setTimeout(() => {
    message.value = null
  }, 3000)
}
</script>
  
<style>
.popup-container {
  width: 380px;
  max-height: 600px;
  padding: 16px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333;
}

.header {
  margin-bottom: 16px;
}

.header h1 {
  margin: 0 0 12px 0;
  font-size: 18px;
  text-align: center;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tabs button {
  flex: 1;
  padding: 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
}

.tabs button.active {
  color: #4285f4;
  border-bottom-color: #4285f4;
  font-weight: 500;
}

.tab-content {
  padding: 16px 0;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
}

.form-group select, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.form-actions button {
  padding: 8px 16px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.form-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.warning-message {
  margin: 16px 0;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message {
  margin: 16px 0;
  padding: 10px;
  border-radius: 4px;
  font-size: 13px;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.link-button {
  background: none;
  border: none;
  color: #4285f4;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: 13px;
}

.result-container {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.result-container h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.result-container pre {
  margin: 0 0 8px 0;
  white-space: pre-wrap;
  font-size: 12px;
  background: #fff;
  border: 1px solid #eee;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}

.result-container button {
  padding: 6px 12px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.task-list-actions {
  margin-bottom: 16px;
}

.task-list-actions button {
  padding: 8px 16px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.task-list-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.empty-list {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.task-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
}

.task-title {
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 14px;
}

.task-type, .task-date {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.task-status {
  font-size: 12px;
  margin-bottom: 4px;
}

.task-status.completed {
  color: #28a745;
}

.task-status.processing {
  color: #007bff;
}

.task-status.pending {
  color: #6c757d;
}

.task-status.failed {
  color: #dc3545;
}

.task-status.cancelled {
  color: #6c757d;
}

.task-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.action-button {
  margin-bottom: 4px;
  padding: 4px 8px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.action-button.cancel {
  background: #dc3545;
}

.task-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.task-detail {
  width: 350px;
  max-height: 550px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.task-detail h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  text-align: center;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-item strong {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
}

.detail-item pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
  background: #f8f9fa;
  border: 1px solid #eee;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>