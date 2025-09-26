/// <reference types="chrome" />

// 简化的接口定义
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

console.log('[AIHC助手] Background Script 启动');

// 监听扩展图标点击事件，打开侧边栏
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[AIHC助手] 扩展图标被点击，当前标签页ID:', tab.id, '窗口ID:', tab.windowId);
  
  try {
    // 立即检查权限，减少异步延迟
    const hasPermission = await chrome.permissions.contains({ permissions: ['sidePanel'] });
    console.log('[AIHC助手] sidePanel权限检查:', hasPermission);
    
    if (!hasPermission) {
      console.error('[AIHC助手] 缺少sidePanel权限');
      return;
    }
    
    // 验证窗口信息
    if (!tab.id || !tab.windowId) {
      console.error('[AIHC助手] 无效的标签页或窗口ID');
      return;
    }
    
    console.log('[AIHC助手] 尝试打开侧边栏...');
    
    // 直接调用，不使用await来减少异步延迟
    chrome.sidePanel.open({ windowId: tab.windowId })
      .then(() => {
        console.log('[AIHC助手] 侧边栏已成功打开');
      })
      .catch((error) => {
        console.error('[AIHC助手] 侧边栏打开失败:', error);
        // 如果sidePanel失败，尝试fallback到action popup
        console.log('[AIHC助手] 尝试fallback方案...');
        tryFallbackSolution();
      });
      
  } catch (error) {
    console.error('[AIHC助手] 打开侧边栏失败:', error);
    if (error instanceof Error) {
      console.error('[AIHC助手] 错误详情:', error.message, error.stack);
    }
    // 尝试fallback方案
    tryFallbackSolution();
  }
});

// Fallback解决方案
function tryFallbackSolution() {
  console.log('[AIHC助手] 执行fallback方案');
  // 如果sidePanel不工作，可以考虑其他方案
  // 比如注入一个全屏的面板或者弹窗
  
  // 暂时显示一个提示
  if (chrome.notifications) {
    try {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'assets/icons/icon48.png',
        title: 'AIHC助手',
        message: '无法打开侧边栏，请检查Chrome版本是否支持sidePanel API (需要Chrome 114+)'
      });
    } catch {
      console.log('[AIHC助手] 通知API也不可用');
    }
  }
}

// 初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('[AIHC助手] 插件已安装');
  
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
  console.log('[AIHC助手] 收到消息:', message);
  
  const handleAsync = async () => {
    try {
      switch (message.action) {
        case 'openSidePanel':
          // 注意：由于用户手势限制，这里只能返回指导信息
          return { 
            success: false, 
            error: '请直接点击浏览器工具栏中的插件图标来打开侧边栏',
            shouldClickIcon: true
          };
        case 'getHelperConfig':
          return await getHelperConfig();
        case 'updateHelperConfig':
          return await updateHelperConfig(message.config);
        case 'openOptionsPage':
          chrome.runtime.openOptionsPage();
          return { success: true };
        default:
          return { success: false, error: '未知操作' };
      }
    } catch (error) {
      console.error('[AIHC助手] 处理消息失败:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  handleAsync().then(sendResponse);
  return true; // 异步响应
});

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

console.log('[AIHC助手] Background Script 初始化完成');