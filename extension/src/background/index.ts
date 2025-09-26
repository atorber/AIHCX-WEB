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

// 监听扩展图标点击事件，打开侧边栏
chrome.action.onClicked.addListener(async (tab) => {
  console.log('扩展图标被点击')
  
  try {
    // 打开侧边栏
    if (tab.id) {
      await chrome.sidePanel.open({ windowId: tab.windowId })
      console.log('侧边栏已打开')
    }
  } catch (error) {
    console.error('打开侧边栏失败:', error)
  }
})

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
  
  // 打开侧边栏
  if (message.action === 'openSidePanel') {
    try {
      // 获取当前活动标签页
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0 && tabs[0].windowId) {
          chrome.sidePanel.open({ windowId: tabs[0].windowId }, () => {
            if (chrome.runtime.lastError) {
              sendResponse({ success: false, error: chrome.runtime.lastError.message })
            } else {
              sendResponse({ success: true })
            }
          })
        } else {
          sendResponse({ success: false, error: '无法获取当前窗口信息' })
        }
      })
    } catch (error) {
      console.error('打开侧边栏失败:', error)
      sendResponse({ success: false, error: '打开侧边栏失败' })
    }
    return true
  }

  // 打开弹出窗口
  if (message.action === 'openPopup') {
    chrome.action.openPopup()
    sendResponse({ success: true })
    return true
  }

  // 获取popup内容
  if (message.action === 'getPopupContent') {
    getPopupContent().then(sendResponse)
    return true
  }

  // 加载任务详情
  if (message.action === 'loadTaskDetails') {
    loadTaskDetails(message.url).then(sendResponse)
    return true
  }

  // 打开设置页面
  if (message.action === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return true;
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

// 获取popup内容
async function getPopupContent(): Promise<{ success: boolean, content?: string }> {
  try {
    // 获取当前活动标签页
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tabs || tabs.length === 0) {
      return { success: false }
    }

    const currentTab = tabs[0]
    if (!currentTab.url) {
      return { success: false }
    }

    // 检查是否为支持的页面
    const supportedUrls = [
      'https://console.bce.baidu.com/aihc/resources',
      'https://console.bce.baidu.com/aihc/resource/info',
      'https://console.bce.baidu.com/aihc/resource/queue',
      'https://console.bce.baidu.com/aihc/tasks',
      'https://console.bce.baidu.com/aihc/infoTaskIndex/detail'
    ]

    const isSupported = supportedUrls.some(url => currentTab.url!.startsWith(url))
    
    if (!isSupported) {
      return {
        success: true,
        content: `
          <div style="text-align: center; padding: 40px 20px;">
            <h3 style="color: #666; margin-bottom: 16px;">AIHC助手</h3>
            <p style="color: #999; margin-bottom: 20px;">请在百舸AIHC控制台页面使用</p>
            <a href="https://console.bce.baidu.com/aihc" target="_blank" 
               style="color: #4285f4; text-decoration: none;">前往控制台</a>
          </div>
        `
      }
    }

    // 解析URL参数
    const urlParams = new URLSearchParams(currentTab.url.split('?')[1] || '')
    const clusterUuid = urlParams.get('clusterUuid') || urlParams.get('clusters') || ''
    const jobId = urlParams.get('jobId') || urlParams.get('k8sName') || ''
    const queueId = urlParams.get('queueID') || urlParams.get('queue') || ''

    // 根据页面类型生成相应的内容
    const pageName = getPageName(currentTab.url)
    let pageContent = ''

    if (currentTab.url.includes('/aihc/resources')) {
      pageContent = `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 12px;">资源池列表</h3>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <strong>CLI命令:</strong><br>
            <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">aihc pool list</code>
          </div>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
            <strong>API文档:</strong><br>
            <a href="https://cloud.baidu.com/doc/AIHC/s/Km569l8xl" target="_blank" style="color: #4285f4;">获取资源池列表</a>
          </div>
        </div>
      `
    } else if (currentTab.url.includes('/aihc/resource/info')) {
      const cliCommand = clusterUuid ? `aihc pool get -p ${clusterUuid}` : 'aihc pool get -p [clusterUuid]'
      pageContent = `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 12px;">资源池详情</h3>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <strong>CLI命令:</strong><br>
            <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${cliCommand}</code>
          </div>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
            <strong>API文档:</strong><br>
            <a href="https://cloud.baidu.com/doc/AIHC/s/9m569kh7t" target="_blank" style="color: #4285f4;">获取资源池详情</a>
          </div>
        </div>
      `
    } else if (currentTab.url.includes('/aihc/resource/queue')) {
      const cliCommand = clusterUuid ? `aihc queue list -p ${clusterUuid}` : 'aihc queue list -p [clusterUuid]'
      pageContent = `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 12px;">队列列表</h3>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <strong>CLI命令:</strong><br>
            <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${cliCommand}</code>
          </div>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
            <strong>API文档:</strong><br>
            <a href="https://cloud.baidu.com/doc/AIHC/s/zm569o5xc" target="_blank" style="color: #4285f4;">获取队列列表</a>
          </div>
        </div>
      `
    } else if (currentTab.url.includes('/aihc/tasks')) {
      const cliCommand = clusterUuid ? `aihc job list -p ${clusterUuid}` : 'aihc job list -p [clusterUuid]'
      pageContent = `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 12px;">任务列表</h3>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <strong>CLI命令:</strong><br>
            <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${cliCommand}</code>
          </div>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
            <strong>API文档:</strong><br>
            <a href="https://cloud.baidu.com/doc/AIHC/s/rm56ipjsz" target="_blank" style="color: #4285f4;">获取任务列表</a>
          </div>
        </div>
      `
    } else if (currentTab.url.includes('/aihc/infoTaskIndex/detail')) {
      const getCommand = jobId && clusterUuid ? `aihc job get ${jobId} -p ${clusterUuid}` : 'aihc job get [jobId] -p [clusterUuid]'
      const createCommand = clusterUuid ? `aihc job create -p ${clusterUuid} [参数]` : 'aihc job create -p [clusterUuid] [参数]'
      pageContent = `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 12px;">任务详情</h3>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <strong>获取任务详情:</strong><br>
            <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${getCommand}</code>
          </div>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <strong>创建任务:</strong><br>
            <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${createCommand}</code>
          </div>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <strong>API文档:</strong><br>
            <a href="https://cloud.baidu.com/doc/AIHC/s/rm56ipjsz" target="_blank" style="color: #4285f4;">获取任务详情</a><br>
            <a href="https://cloud.baidu.com/doc/AIHC/s/jm56inxn7" target="_blank" style="color: #4285f4;">创建任务</a>
          </div>
          <div style="text-align: center; margin-top: 12px;">
            <button onclick="loadTaskDetails('${currentTab.url}')" 
                    style="padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              加载完整任务参数
            </button>
          </div>
        </div>
      `
    }

    // 返回完整的popup内容
    return {
      success: true,
      content: `
        <div style="padding: 20px;">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 8px;">当前页面</h3>
            <p style="color: #666; font-size: 14px;">${pageName}</p>
          </div>
          ${pageContent}
          
          <!-- 添加更多功能区域 -->
          <div style="margin-top: 30px;">
            <h3 style="color: #333; margin-bottom: 12px;">快速操作</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button onclick="copyToClipboard('${clusterUuid || '[clusterUuid]'}')" 
                      style="padding: 8px 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer; font-size: 12px;">
                复制 Cluster UUID
              </button>
              ${jobId ? `
              <button onclick="copyToClipboard('${jobId}')" 
                      style="padding: 8px 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer; font-size: 12px;">
                复制 Job ID
              </button>
              ` : ''}
              ${queueId ? `
              <button onclick="copyToClipboard('${queueId}')" 
                      style="padding: 8px 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; cursor: pointer; font-size: 12px;">
                复制 Queue ID
              </button>
              ` : ''}
            </div>
          </div>
          
          <div style="margin-top: 30px;">
            <h3 style="color: #333; margin-bottom: 12px;">常用命令</h3>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
              <strong>查看资源池状态:</strong><br>
              <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">aihc pool status -p ${clusterUuid || '[clusterUuid]'}</code>
            </div>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
              <strong>查看任务日志:</strong><br>
              <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">aihc job logs ${jobId || '[jobId]'} -p ${clusterUuid || '[clusterUuid]'}</code>
            </div>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
              <strong>停止任务:</strong><br>
              <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">aihc job stop ${jobId || '[jobId]'} -p ${clusterUuid || '[clusterUuid]'}</code>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin-bottom: 8px;">需要更多功能？</p>
            <button onclick="openFullPopup()" 
                    style="padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
              打开完整界面
            </button>
          </div>
        </div>
      `
    }
  } catch (error) {
    console.error('获取popup内容失败:', error)
    return { success: false }
  }
}

// 根据URL获取页面名称
function getPageName(url: string): string {
  if (url.includes('/aihc/resources')) return '资源池列表'
  if (url.includes('/aihc/resource/info')) return '资源池详情'
  if (url.includes('/aihc/resource/queue')) return '队列列表'
  if (url.includes('/aihc/tasks')) return '任务列表'
  if (url.includes('/aihc/infoTaskIndex/detail')) return '任务详情'
  return 'AIHC控制台'
}

// 加载任务详情
async function loadTaskDetails(url: string): Promise<{ success: boolean, data?: any, error?: string }> {
  try {
    console.log('[AIHC助手] loadTaskDetails 开始执行，URL:', url);
    
    // 解析URL参数
    const urlParams = new URLSearchParams(url.split('?')[1] || '')
    const clusterUuid = urlParams.get('clusterUuid') || ''
    const k8sName = urlParams.get('k8sName') || ''
    const kind = urlParams.get('kind') || ''
    const k8sNamespace = urlParams.get('k8sNamespace') || ''
    const queueID = urlParams.get('queueID') || ''

    console.log('[AIHC助手] 解析的URL参数:', { clusterUuid, k8sName, kind, k8sNamespace, queueID });

    // 检查是否缺少必要参数
    if (!clusterUuid) {
      console.error('[AIHC助手] 缺少clusterUuid参数');
      return { success: false, error: '缺少clusterUuid参数' }
    }
    
    if (!k8sName) {
      console.error('[AIHC助手] 缺少k8sName参数');
      return { success: false, error: '缺少k8sName参数' }
    }

    // 构建API请求URL
    const apiUrl = `https://console.bce.baidu.com/api/cce/ai-service/v1/cluster/${clusterUuid}/aijob/${k8sName}?kind=${kind}&namespace=${k8sNamespace}&queueID=${queueID}&locale=zh-cn&_=${Date.now()}`
    
    console.log('[AIHC助手] 请求任务详情API:', apiUrl)
    
    // 发送API请求
    const response = await fetch(apiUrl)
    const data = await response.json()
    
    console.log('[AIHC助手] API响应状态:', response.status);
    console.log('[AIHC助手] API响应数据:', data);
    
    if (!data.result || !data.result.rawRequest) {
      console.error('[AIHC助手] API响应中缺少必要的数据字段');
      return { success: false, error: 'API响应中缺少必要的数据字段' }
    }

    // 解析任务信息
    let taskInfo
    let requestParams: any = {}
    
    try {
      taskInfo = JSON.parse(data.result.rawRequest)
      console.log('解析后的任务信息:', taskInfo)
      
      // 格式化请求参数（这里需要实现formatRequestParams函数）
      requestParams = formatRequestParams(taskInfo)
      
    } catch (e) {
      const error = e as Error
      console.error('JSON解析错误:', error)
      return { success: false, error: '解析任务信息失败: ' + error.message }
    }

    // 生成CLI命令
    const cliCommand = generateCLICommand(requestParams)
    
    // 生成JSON和YAML参数
    const jsonParams = JSON.stringify(requestParams, null, 2)
    const yamlParams = generateYAML(requestParams)

    return {
      success: true,
      data: {
        cliCommand,
        jsonParams,
        yamlParams,
        commandScript: requestParams.jobSpec?.command || ''
      }
    }

  } catch (error) {
    console.error('加载任务详情失败:', error)
    return { 
      success: false, 
      error: '加载任务详情失败: ' + (error instanceof Error ? error.message : String(error))
    }
  }
}

// 格式化请求参数
function formatRequestParams(params: any): any {
  if (!params || typeof params !== 'object') {
    return {};
  }

  // 基于真实API响应数据构建参数
  const jobSpec = {
    "image": params.jobSpec?.Master?.image || "registry.baidubce.com/cce-ai-native/cy-pytorch-mnist",
    "imageConfig": {
      "username": "",
      "password": ""
    },
    "replicas": params.jobSpec?.Master?.replicas || 1,
    "resources": params.jobSpec?.Master?.resource ? [
      {
        "name": "cpu",
        "quantity": params.jobSpec.Master.resource.cpu || 1
      }
    ] : [
      {
        "name": "cpu",
        "quantity": 1
      }
    ],
    "command": params.command || "#! /bin/bash",
    "envs": params.jobSpec?.Master?.env ? Object.entries(params.jobSpec.Master.env).map(([name, value]) => ({
      "name": name,
      "value": value
    })) : [],
    "volumes": params.datasource ? params.datasource.map((ds: any) => ({
      "name": ds.name,
      "mountPath": ds.mountPath,
      "type": ds.type
    })) : [],
    "enableRDMA": params.enableBccl || false
  };

  const requestParams = {
    "name": params.name || "task-name",
    "jobFramework": params.jobFramework || "pytorch",
    "jobSpec": jobSpec,
    "queue": params.queue || "default",
    "priority": params.priority || "normal",
    "faultTolerance": params.faultTolerance || false,
    "oversell": params.oversell || false
  };

  return requestParams;
}

// 生成CLI命令
function generateCLICommand(taskInfo: any): string {
  // 生成CLI命令
  let cliCommand = `aihc job create --name ${taskInfo.name} \\
    --framework ${taskInfo.jobFramework} \\
    --image ${taskInfo.jobSpec.image} \\\n`;

  // 添加队列参数（如果有）
  if (taskInfo.queue && taskInfo.queue !== 'default') {
    cliCommand += `    --pool ${taskInfo.queue} \\\n`;
  }

  // 添加优先级参数
  if (taskInfo.priority && taskInfo.priority !== 'normal') {
    cliCommand += `    --priority ${taskInfo.priority} \\\n`;
  }

  // 添加容错参数
  if (taskInfo.faultTolerance) {
    cliCommand += `    --fault-tolerance \\\n`;
  }

  // 添加RDMA参数
  cliCommand += `    --enable-rdma=${taskInfo.jobSpec.enableRDMA || false} \\\n`;

  // 添加CPU资源
  if (taskInfo.jobSpec.resources) {
    taskInfo.jobSpec.resources.forEach((item: { name: string, quantity: number }) => {
      if (item.name === 'cpu') {
        cliCommand += `    --cpu ${item.quantity} \\\n`;
      } else {
        cliCommand += `    --gpu ${item.name}=${item.quantity} \\\n`;
      }
    });
  }

  // 添加环境变量（如果有）
  if (taskInfo.jobSpec.envs && taskInfo.jobSpec.envs.length > 0) {
    taskInfo.jobSpec.envs.forEach((env: { name: string, value: string }) => {
      cliCommand += `    --env ${env.name}=${env.value} \\\n`;
    });
  }

  // 添加卷挂载（如果有）
  if (taskInfo.jobSpec.volumes && taskInfo.jobSpec.volumes.length > 0) {
    taskInfo.jobSpec.volumes.forEach((volume: any) => {
      cliCommand += `    --volume ${volume.name}:${volume.mountPath} \\\n`;
    });
  }

  // 添加命令
  if (taskInfo.jobSpec.command) {
    cliCommand += `    --command "${taskInfo.jobSpec.command}"`;
  }

  return cliCommand;
}

// 生成YAML
function generateYAML(data: any): string {
  // 简化的YAML生成，不使用外部库
  const yamlLines: string[] = [];
  
  function addToYaml(obj: any, indent: number = 0): void {
    const spaces = '  '.repeat(indent);
    
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          yamlLines.push(`${spaces}${key}:`);
          value.forEach(item => {
            if (typeof item === 'object') {
              yamlLines.push(`${spaces}  -`);
              addToYaml(item, indent + 2);
            } else {
              yamlLines.push(`${spaces}  - ${item}`);
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          yamlLines.push(`${spaces}${key}:`);
          addToYaml(value, indent + 1);
        } else {
          yamlLines.push(`${spaces}${key}: ${value}`);
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (typeof item === 'object') {
          yamlLines.push(`${spaces}-`);
          addToYaml(item, indent + 1);
        } else {
          yamlLines.push(`${spaces}- ${item}`);
        }
      });
    } else {
      yamlLines.push(`${spaces}${obj}`);
    }
  }
  
  addToYaml(data);
  return yamlLines.join('\n');
}