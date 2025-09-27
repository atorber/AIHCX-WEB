/// <reference types="chrome" />

// 接口定义
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
  console.log('[AIHC助手] 扩展图标被点击，当前标签页ID:', tab.id, '窗口ID:', tab.windowId);

  try {
    // 打开侧边栏
    if (tab.windowId) {
      console.log('[AIHC助手] 尝试打开侧边栏...');
      await chrome.sidePanel.open({ windowId: tab.windowId });
      console.log('[AIHC助手] 侧边栏已成功打开');
    } else {
      console.error('[AIHC助手] 无效的窗口ID');
    }
  } catch (error) {
    console.error('[AIHC助手] 打开侧边栏失败:', error);
    // 尝试输出更详细的错误信息
    if (error instanceof Error) {
      console.error('[AIHC助手] 错误详情:', error.message, error.stack);
    }
  }
});

// 初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('AIHC 助手已安装');
  
  // 初始化存储空间
  chrome.storage.local.set({ 
    tasks: [],
    lastSync: null,
    helperConfig: defaultHelperConfig,
    tempImageData: null
  });
});

// 监听来自popup和content的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('收到消息:', message);
  
  // 处理各种消息类型
  if (message.action === 'getCredentials') {
    getCredentials().then(sendResponse);
    return true;
  }
  
  if (message.action === 'generateParams') {
    generateTaskParams(message.data).then(sendResponse);
    return true;
  }
  
  if (message.action === 'createTask') {
    createTask(message.data).then(sendResponse);
    return true;
  }
  
  if (message.action === 'getTasks') {
    getTasks().then(sendResponse);
    return true;
  }
  
  if (message.action === 'cancelTask') {
    cancelTask(message.taskId).then(sendResponse);
    return true;
  }
  
  if (message.action === 'getHelperConfig') {
    getHelperConfig().then(sendResponse);
    return true;
  }
  
  if (message.action === 'updateHelperConfig') {
    updateHelperConfig(message.config).then(sendResponse);
    return true;
  }
  
  if (message.action === 'processImage') {
    processImage(message.imageInfo).then(sendResponse);
    return true;
  }
  
  if (message.action === 'addImageToTask') {
    addImageToTask(message.imageInfo).then(sendResponse);
    return true;
  }
  
  if (message.action === 'getTempImageData') {
    getTempImageData().then(sendResponse);
    return true;
  }
  
  if (message.action === 'clearTempImageData') {
    clearTempImageData().then(sendResponse);
    return true;
  }
  
  // 打开侧边栏 - 与Vue版本完全一致的实现
  if (message.action === 'openSidePanel') {
    try {
      // 获取当前活动标签页
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0 && tabs[0].windowId) {
          chrome.sidePanel.open({ windowId: tabs[0].windowId }, () => {
            if (chrome.runtime.lastError) {
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
              sendResponse({ success: true });
            }
          });
        } else {
          sendResponse({ success: false, error: '无法获取当前窗口信息' });
        }
      });
    } catch (error) {
      console.error('打开侧边栏失败:', error);
      sendResponse({ success: false, error: '打开侧边栏失败' });
    }
    return true;
  }

  // 关闭侧边栏
  if (message.action === 'closeSidePanel') {
    try {
      // Chrome sidePanel API没有直接关闭的方法
      // 可以尝试重新打开（可能覆盖当前实例）或提示用户手动关闭
      // 或者通过其他方式实现关闭效果

      // 方案1：尝试使用其他API方法（如果有的话）
      // 方案2：提示用户手动关闭
      // 方案3：隐藏侧边栏（如果API支持）

      console.log('[AIHC助手] 尝试关闭侧边栏');

      // 目前Chrome sidePanel API没有直接关闭方法
      // 我们可以返回成功，让content script更新UI状态
      // 用户可以手动关闭侧边栏或通过其他方式

      // 尝试通过重新打开来切换状态（这可能不会关闭）
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0 && tabs[0].windowId) {
          // 尝试获取侧边栏状态
          chrome.sidePanel.getOptions({}, (options) => {
            if (chrome.runtime.lastError) {
              console.log('[AIHC助手] 无法获取侧边栏状态，可能是因为没有打开');
              sendResponse({ success: true, message: '侧边栏已关闭或未打开' });
            } else {
              console.log('[AIHC助手] 侧边栏状态:', options);
              sendResponse({ success: true, message: '请手动关闭侧边栏' });
            }
          });
        } else {
          sendResponse({ success: false, error: '无法获取当前窗口信息' });
        }
      });
    } catch (error) {
      console.error('关闭侧边栏失败:', error);
      sendResponse({ success: false, error: '关闭侧边栏失败' });
    }
    return true;
  }
  
  if (message.action === 'openPopup') {
    chrome.action.openPopup();
    sendResponse({ success: true });
    return true;
  }

  // 关闭侧边栏
  if (message.action === 'closeSidebar') {
    try {
      // Chrome sidePanel API没有直接关闭的方法
      // 但是我们可以尝试以下方法：
      // 1. 重新打开侧边栏（可能会覆盖当前内容）
      // 2. 或者提示用户手动关闭
      // 3. 或者使用其他API方法

      console.log('[AIHC助手] 尝试关闭侧边栏');

      // 方案：尝试重新打开侧边栏，可能会刷新或覆盖当前内容
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0 && tabs[0].windowId) {
          chrome.sidePanel.open({ windowId: tabs[0].windowId }, () => {
            if (chrome.runtime.lastError) {
              console.log('[AIHC助手] 无法重新打开侧边栏，可能是因为没有权限');
              sendResponse({ success: false, error: '无法关闭侧边栏' });
            } else {
              console.log('[AIHC助手] 尝试重新打开侧边栏');
              // 重新打开可能会刷新侧边栏内容，用户可能需要手动关闭
              sendResponse({ success: true, message: '侧边栏已刷新，请手动关闭' });
            }
          });
        } else {
          sendResponse({ success: false, error: '无法获取当前窗口信息' });
        }
      });
    } catch (error) {
      console.error('关闭侧边栏失败:', error);
      sendResponse({ success: false, error: '关闭侧边栏失败' });
    }
    return true;
  }

  // 更新侧边栏状态
  if (message.action === 'updateSidebarState') {
    try {
      // 向所有content scripts发送状态更新消息
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'updateSidebarState',
              state: message.state
            });
          }
        });
      });

      sendResponse({ success: true });
    } catch (error) {
      console.error('更新侧边栏状态失败:', error);
      sendResponse({ success: false, error: '更新侧边栏状态失败' });
    }
    return true;
  }
  
  // 处理表单填充消息，转发给content script
  if (message.type === 'FILL_DATASET_FORM') {
    console.log('[AIHC助手] Background收到表单填充请求:', message.data);
    
    // 获取当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].id) {
        // 转发消息给content script
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[AIHC助手] 转发消息失败:', chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            console.log('[AIHC助手] 表单填充消息转发成功:', response);
            sendResponse(response);
          }
        });
      } else {
        console.error('[AIHC助手] 无法获取当前活动标签页');
        sendResponse({ success: false, error: '无法获取当前活动标签页' });
      }
    });
    return true; // 异步响应
  }
});

// 获取凭证
async function getCredentials(): Promise<BaiduCredentials | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['ak', 'sk', 'apiEndpoint'], (result) => {
      if (result.ak && result.sk) {
        resolve({
          ak: result.ak,
          sk: result.sk,
          endpoint: result.apiEndpoint || undefined
        });
      } else {
        resolve(null);
      }
    });
  });
}

// 获取辅助配置
async function getHelperConfig(): Promise<{ success: boolean; config?: AIHCXHelperConfig }> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['helperConfig'], (result) => {
      if (result.helperConfig) {
        resolve({
          success: true,
          config: result.helperConfig
        });
      } else {
        // 如果没有配置，使用默认配置并保存
        chrome.storage.local.set({ helperConfig: defaultHelperConfig }, () => {
          resolve({
            success: true,
            config: defaultHelperConfig
          });
        });
      }
    });
  });
}

// 更新辅助配置
async function updateHelperConfig(newConfig: Partial<AIHCXHelperConfig>): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['helperConfig'], (result) => {
      const currentConfig = result.helperConfig || defaultHelperConfig;
      const updatedConfig = { ...currentConfig, ...newConfig };
      
      chrome.storage.local.set({ helperConfig: updatedConfig }, () => {
        resolve({ success: true });
      });
    });
  });
}

// 处理图像
async function processImage(imageInfo: any): Promise<{ success: boolean }> {
  // 保存图像信息到临时存储
  return new Promise((resolve) => {
    chrome.storage.local.set({ tempImageData: imageInfo }, () => {
      resolve({ success: true });
    });
  });
}

// 获取临时图像数据
async function getTempImageData(): Promise<{ success: boolean; imageData?: any }> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tempImageData'], (result) => {
      resolve({
        success: true,
        imageData: result.tempImageData || null
      });
    });
  });
}

// 清除临时图像数据
async function clearTempImageData(): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ tempImageData: null }, () => {
      resolve({ success: true });
    });
  });
}

// 添加图像到任务
async function addImageToTask(imageInfo: any): Promise<{ success: boolean; message?: string }> {
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
    };
    
    const result = await createTask(taskData);
    return {
      success: result.success,
      message: result.message || '图像已添加到任务'
    };
  } catch (error) {
    console.error('添加图像到任务失败:', error);
    return { 
      success: false, 
      message: '添加图像失败: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}

// 生成任务参数
async function generateTaskParams(data: any): Promise<any> {
  // 这里可以添加参数验证和处理逻辑
  const params = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  
  return { success: true, params };
}

// 创建任务
async function createTask(data: any): Promise<any> {
  try {
    const credentials = await getCredentials();
    if (!credentials) {
      return { success: false, error: 'API凭证未配置' };
    }
    
    // 实际项目中应该调用API
    // 这里使用本地存储模拟
    const taskId = 'task-' + Date.now();
    const newTask: Task = {
      id: taskId,
      type: data.type,
      status: 'pending',
      createdAt: new Date().toISOString(),
      params: data
    };
    
    // 保存到本地存储
    await new Promise<{tasks: Task[]}>((resolve) => {
      chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        tasks.unshift(newTask);
        chrome.storage.local.set({ tasks }, () => {
          resolve({ tasks });
        });
      });
    });
    
    return { 
      success: true, 
      taskId,
      task: newTask,
      message: '任务已创建'
    };
    
  } catch (error) {
    console.error('创建任务失败:', error);
    return { 
      success: false, 
      error: '创建任务失败: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}

// 获取任务列表
async function getTasks(): Promise<{ success: boolean; tasks?: Task[]; error?: string }> {
  try {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tasks'], (result) => {
        resolve({ 
          success: true, 
          tasks: result.tasks || []
        });
      });
    });
  } catch (error) {
    return { 
      success: false, 
      error: '获取任务失败: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}

// 取消任务
async function cancelTask(taskId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const credentials = await getCredentials();
    if (!credentials) {
      return { success: false, error: 'API凭证未配置' };
    }
    
    // 实际项目中应该调用API
    return new Promise((resolve) => {
      chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
        
        if (taskIndex === -1) {
          resolve({ success: false, error: '任务不存在' });
          return;
        }
        
        if (['completed', 'failed'].includes(tasks[taskIndex].status)) {
          resolve({ success: false, error: '已完成或失败的任务无法取消' });
          return;
        }
        
        tasks[taskIndex].status = 'cancelled';
        tasks[taskIndex].completedAt = new Date().toISOString();
        
        chrome.storage.local.set({ tasks }, () => {
          resolve({ success: true, message: '任务已取消' });
        });
      });
    });
    
  } catch (error) {
    return { 
      success: false, 
      error: '取消任务失败: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}