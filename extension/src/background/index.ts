/// <reference types="chrome" />

// AIHCX 插件后台服务脚本
// 负责处理API请求、数据存储等

interface BaiduCredentials {
  ak: string;
  sk: string;
  endpoint?: string;
}

interface Task {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  params: Record<string, any>;
  result?: Record<string, any>;
}

interface AIHCXHelperConfig {
  enabled: boolean;
  highlightImages: boolean;
  showImageInfo: boolean;
}

// 默认辅助配置
const defaultHelperConfig: AIHCXHelperConfig = {
  enabled: true,
  highlightImages: true,
  showImageInfo: false
};

// 初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('AIHC 助手已安装')
  
  // 初始化存储空间
  chrome.storage.local.set({ 
    tasks: [],
    lastSync: null,
    helperConfig: defaultHelperConfig,
    tempImageData: null
  })
})

// 监听来自popup和content的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message)
  
  if (message.action === 'getCredentials') {
    getCredentials().then(sendResponse)
    return true // 异步响应
  }
  
  if (message.action === 'generateParams') {
    generateTaskParams(message.data).then(sendResponse)
    return true // 异步响应
  }
  
  if (message.action === 'createTask') {
    createTask(message.data).then(sendResponse)
    return true // 异步响应
  }
  
  if (message.action === 'getTasks') {
    getTasks().then(sendResponse)
    return true // 异步响应
  }
  
  if (message.action === 'cancelTask') {
    cancelTask(message.taskId).then(sendResponse)
    return true // 异步响应
  }

  // 辅助配置相关
  if (message.action === 'getHelperConfig') {
    getHelperConfig().then(sendResponse)
    return true // 异步响应
  }
  
  if (message.action === 'updateHelperConfig') {
    updateHelperConfig(message.config).then(sendResponse)
    return true // 异步响应
  }
  
  // 图像处理相关
  if (message.action === 'processImage') {
    processImage(message.imageInfo).then(sendResponse)
    return true // 异步响应
  }
  
  if (message.action === 'addImageToTask') {
    addImageToTask(message.imageInfo).then(sendResponse)
    return true // 异步响应
  }
  
  if (message.action === 'getTempImageData') {
    getTempImageData().then(sendResponse)
    return true // 异步响应
  }
  
  if (message.action === 'clearTempImageData') {
    clearTempImageData().then(sendResponse)
    return true // 异步响应
  }
  
  // 打开弹出窗口
  if (message.action === 'openPopup') {
    chrome.action.openPopup()
    sendResponse({ success: true })
    return true
  }
})

// 获取凭证
async function getCredentials(): Promise<BaiduCredentials | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['ak', 'sk', 'apiEndpoint'], (result) => {
      if (result.ak && result.sk) {
        resolve({
          ak: result.ak,
          sk: result.sk,
          endpoint: result.apiEndpoint || undefined
        })
      } else {
        resolve(null)
      }
    })
  })
}

// 获取辅助配置
async function getHelperConfig(): Promise<{ success: boolean, config?: AIHCXHelperConfig }> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['helperConfig'], (result) => {
      if (result.helperConfig) {
        resolve({
          success: true,
          config: result.helperConfig
        })
      } else {
        // 如果没有配置，使用默认配置并保存
        chrome.storage.local.set({ helperConfig: defaultHelperConfig }, () => {
          resolve({
            success: true,
            config: defaultHelperConfig
          })
        })
      }
    })
  })
}

// 更新辅助配置
async function updateHelperConfig(newConfig: Partial<AIHCXHelperConfig>): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['helperConfig'], (result) => {
      const currentConfig = result.helperConfig || defaultHelperConfig
      const updatedConfig = { ...currentConfig, ...newConfig }
      
      chrome.storage.local.set({ helperConfig: updatedConfig }, () => {
        resolve({ success: true })
      })
    })
  })
}

// 处理图像
async function processImage(imageInfo: any): Promise<{ success: boolean }> {
  // 保存图像信息到临时存储
  return new Promise((resolve) => {
    chrome.storage.local.set({ tempImageData: imageInfo }, () => {
      resolve({ success: true })
    })
  })
}

// 获取临时图像数据
async function getTempImageData(): Promise<{ success: boolean, imageData?: any }> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tempImageData'], (result) => {
      resolve({
        success: true,
        imageData: result.tempImageData || null
      })
    })
  })
}

// 清除临时图像数据
async function clearTempImageData(): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ tempImageData: null }, () => {
      resolve({ success: true })
    })
  })
}

// 添加图像到任务
async function addImageToTask(imageInfo: any): Promise<{ success: boolean, message?: string }> {
  try {
    // 创建带有图像信息的任务
    const taskData = {
      type: 'ocr', // 默认类型，可以根据需要修改
      dataSource: 'remote',
      priority: 'medium',
      imageUrl: imageInfo.src,
      imageInfo: {
        width: imageInfo.width,
        height: imageInfo.height,
        alt: imageInfo.alt,
        pageUrl: imageInfo.pageUrl
      }
    }
    
    const result = await createTask(taskData)
    return {
      success: result.success,
      message: result.message || '图像已添加到任务'
    }
  } catch (error) {
    console.error('添加图像到任务失败:', error)
    return { 
      success: false, 
      message: '添加图像失败: ' + (error instanceof Error ? error.message : String(error))
    }
  }
}

// 生成任务参数
async function generateTaskParams(data: any): Promise<any> {
  // 这里可以添加参数验证和处理逻辑
  // 实际项目中可能需要调用后端API
  
  const params = {
    ...data,
    timestamp: new Date().toISOString(),
    // 添加其他必要参数
  }
  
  return { success: true, params }
}

// 创建任务
async function createTask(data: any): Promise<any> {
  try {
    const credentials = await getCredentials()
    if (!credentials) {
      return { success: false, error: 'API凭证未配置' }
    }
    
    // 实际项目中应该调用API
    // 这里使用本地存储模拟
    const taskId = 'task-' + Date.now()
    const newTask: Task = {
      id: taskId,
      type: data.type,
      status: 'pending',
      createdAt: new Date().toISOString(),
      params: data
    }
    
    // 保存到本地存储
    const result = await new Promise<{tasks: Task[]}>((resolve) => {
      chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || []
        tasks.unshift(newTask)
        chrome.storage.local.set({ tasks }, () => {
          resolve({ tasks })
        })
      })
    })
    
    return { 
      success: true, 
      taskId,
      task: newTask,
      message: '任务已创建'
    }
    
  } catch (error) {
    console.error('创建任务失败:', error)
    return { 
      success: false, 
      error: '创建任务失败: ' + (error instanceof Error ? error.message : String(error))
    }
  }
}

// 获取任务列表
async function getTasks(): Promise<{ success: boolean, tasks?: Task[], error?: string }> {
  try {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tasks'], (result) => {
        resolve({ 
          success: true, 
          tasks: result.tasks || []
        })
      })
    })
  } catch (error) {
    return { 
      success: false, 
      error: '获取任务失败: ' + (error instanceof Error ? error.message : String(error))
    }
  }
}

// 取消任务
async function cancelTask(taskId: string): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    const credentials = await getCredentials()
    if (!credentials) {
      return { success: false, error: 'API凭证未配置' }
    }
    
    // 实际项目中应该调用API
    // 这里使用本地存储模拟
    return new Promise((resolve) => {
      chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || []
        const taskIndex = tasks.findIndex((t: Task) => t.id === taskId)
        
        if (taskIndex === -1) {
          resolve({ success: false, error: '任务不存在' })
          return
        }
        
        if (['completed', 'failed'].includes(tasks[taskIndex].status)) {
          resolve({ success: false, error: '已完成或失败的任务无法取消' })
          return
        }
        
        tasks[taskIndex].status = 'cancelled'
        tasks[taskIndex].completedAt = new Date().toISOString()
        
        chrome.storage.local.set({ tasks }, () => {
          resolve({ success: true, message: '任务已取消' })
        })
      })
    })
    
  } catch (error) {
    return { 
      success: false, 
      error: '取消任务失败: ' + (error instanceof Error ? error.message : String(error))
    }
  }
}