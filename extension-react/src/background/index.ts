/// <reference types="chrome" />

import { formatRequestParams, generateYAML, generateCLICommand } from '../utils/common';

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
    // 检查权限
    const hasPermission = await chrome.permissions.contains({ permissions: ['sidePanel'] });
    console.log('[AIHC助手] sidePanel权限检查:', hasPermission);
    
    if (!hasPermission) {
      console.error('[AIHC助手] 缺少sidePanel权限');
      return;
    }
    
    // 打开侧边栏
    if (tab.id && tab.windowId) {
      console.log('[AIHC助手] 尝试打开侧边栏...');
      await chrome.sidePanel.open({ windowId: tab.windowId });
      console.log('[AIHC助手] 侧边栏已成功打开');
    } else {
      console.error('[AIHC助手] 无效的标签页或窗口ID');
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
  
  const handleAsync = async () => {
    try {
      switch (message.action) {
        case 'getCredentials':
          return await getCredentials();
        case 'generateParams':
          return await generateTaskParams(message.data);
        case 'createTask':
          return await createTask(message.data);
        case 'getTasks':
          return await getTasks();
        case 'cancelTask':
          return await cancelTask(message.taskId);
        case 'getHelperConfig':
          return await getHelperConfig();
        case 'updateHelperConfig':
          return await updateHelperConfig(message.config);
        case 'processImage':
          return await processImage(message.imageInfo);
        case 'addImageToTask':
          return await addImageToTask(message.imageInfo);
        case 'getTempImageData':
          return await getTempImageData();
        case 'clearTempImageData':
          return await clearTempImageData();
        case 'openSidePanel':
          return await openSidePanel();
        case 'openPopup':
          return openPopup();
        case 'getPopupContent':
          return await getPopupContent();
        case 'loadTaskDetails':
          return await loadTaskDetails(message.url);
        case 'openOptionsPage':
          chrome.runtime.openOptionsPage();
          return { success: true };
        default:
          return { success: false, error: '未知操作' };
      }
    } catch (error) {
      console.error('处理消息失败:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  handleAsync().then(sendResponse);
  return true; // 异步响应
});

// 打开侧边栏
async function openSidePanel(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[AIHC助手] openSidePanel函数被调用');
    
    // 检查权限
    const hasPermission = await chrome.permissions.contains({ permissions: ['sidePanel'] });
    console.log('[AIHC助手] sidePanel权限检查:', hasPermission);
    
    if (!hasPermission) {
      console.error('[AIHC助手] 缺少sidePanel权限');
      return { success: false, error: '缺少sidePanel权限' };
    }
    
    // 获取当前活动标签页
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('[AIHC助手] 当前活动标签页:', tabs);
    
    if (tabs && tabs.length > 0 && tabs[0].windowId) {
      const tab = tabs[0];
      console.log('[AIHC助手] 准备打开侧边栏，窗口ID:', tab.windowId);
      
      await chrome.sidePanel.open({ windowId: tab.windowId });
      console.log('[AIHC助手] 侧边栏已成功打开');
      return { success: true };
    } else {
      console.error('[AIHC助手] 无法获取当前窗口信息，tabs:', tabs);
      return { success: false, error: '无法获取当前窗口信息' };
    }
  } catch (error) {
    console.error('[AIHC助手] 打开侧边栏失败:', error);
    if (error instanceof Error) {
      console.error('[AIHC助手] 错误详情:', error.message, error.stack);
      return { success: false, error: `打开侧边栏失败: ${error.message}` };
    }
    return { success: false, error: '打开侧边栏失败' };
  }
}

// 打开弹出窗口
function openPopup(): { success: boolean } {
  chrome.action.openPopup();
  return { success: true };
}

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

// 获取popup内容
async function getPopupContent(): Promise<{ success: boolean; content?: string }> {
  try {
    // 获取当前活动标签页
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      return { success: false };
    }

    const currentTab = tabs[0];
    if (!currentTab.url) {
      return { success: false };
    }

    // 检查是否为支持的页面
    const supportedUrls = [
      'https://console.bce.baidu.com/aihc/resources',
      'https://console.bce.baidu.com/aihc/resource/info',
      'https://console.bce.baidu.com/aihc/resource/queue',
      'https://console.bce.baidu.com/aihc/tasks',
      'https://console.bce.baidu.com/aihc/infoTaskIndex/detail'
    ];

    const isSupported = supportedUrls.some(url => currentTab.url!.startsWith(url));
    
    if (!isSupported) {
      return {
        success: true,
        content: '请在百舸AIHC控制台页面使用'
      };
    }

    return {
      success: true,
      content: '支持的页面'
    };
  } catch (error) {
    console.error('获取popup内容失败:', error);
    return { success: false };
  }
}

// 加载任务详情
async function loadTaskDetails(url: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('[AIHC助手] loadTaskDetails 开始执行，URL:', url);
    
    // 解析URL参数
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const clusterUuid = urlParams.get('clusterUuid') || '';
    const k8sName = urlParams.get('k8sName') || '';
    const kind = urlParams.get('kind') || '';
    const k8sNamespace = urlParams.get('k8sNamespace') || '';
    const queueID = urlParams.get('queueID') || '';

    console.log('[AIHC助手] 解析的URL参数:', { clusterUuid, k8sName, kind, k8sNamespace, queueID });

    // 检查是否缺少必要参数
    if (!clusterUuid) {
      console.error('[AIHC助手] 缺少clusterUuid参数');
      return { success: false, error: '缺少clusterUuid参数' };
    }
    
    if (!k8sName) {
      console.error('[AIHC助手] 缺少k8sName参数');
      return { success: false, error: '缺少k8sName参数' };
    }

    // 构建API请求URL
    const apiUrl = `https://console.bce.baidu.com/api/cce/ai-service/v1/cluster/${clusterUuid}/aijob/${k8sName}?kind=${kind}&namespace=${k8sNamespace}&queueID=${queueID}&locale=zh-cn&_=${Date.now()}`;
    
    console.log('[AIHC助手] 请求任务详情API:', apiUrl);
    
    // 发送API请求
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('[AIHC助手] API响应状态:', response.status);
    console.log('[AIHC助手] API响应数据:', data);
    
    if (!data.result || !data.result.rawRequest) {
      console.error('[AIHC助手] API响应中缺少必要的数据字段');
      return { success: false, error: 'API响应中缺少必要的数据字段' };
    }

    // 解析任务信息
    let taskInfo;
    let requestParams: any = {};
    
    try {
      taskInfo = JSON.parse(data.result.rawRequest);
      console.log('解析后的任务信息:', taskInfo);
      
      // 格式化请求参数
      requestParams = formatRequestParams(taskInfo);
      
    } catch (e) {
      const error = e as Error;
      console.error('JSON解析错误:', error);
      return { success: false, error: '解析任务信息失败: ' + error.message };
    }

    // 生成CLI命令
    const cliCommand = generateCLICommand(requestParams);
    
    // 生成JSON和YAML参数
    const jsonParams = JSON.stringify(requestParams, null, 2);
    const yamlParams = generateYAML(requestParams);

    return {
      success: true,
      data: {
        cliCommand,
        jsonParams,
        yamlParams,
        commandScript: requestParams.jobSpec?.command || ''
      }
    };

  } catch (error) {
    console.error('加载任务详情失败:', error);
    return { 
      success: false, 
      error: '加载任务详情失败: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}