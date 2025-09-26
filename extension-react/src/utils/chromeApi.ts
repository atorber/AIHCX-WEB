import { BaiduCredentials, Task, AIHCXHelperConfig } from '../types';

// Chrome存储API包装
export const storage = {
  // 同步存储
  sync: {
    get: (keys: string[]): Promise<Record<string, any>> => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(keys, resolve);
      });
    },
    set: (items: Record<string, any>): Promise<void> => {
      return new Promise((resolve) => {
        chrome.storage.sync.set(items, resolve);
      });
    }
  },
  
  // 本地存储
  local: {
    get: (keys: string[]): Promise<Record<string, any>> => {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, resolve);
      });
    },
    set: (items: Record<string, any>): Promise<void> => {
      return new Promise((resolve) => {
        chrome.storage.local.set(items, resolve);
      });
    }
  }
};

// Chrome runtime API包装
export const runtime = {
  sendMessage: (message: any): Promise<any> => {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            // 完全静默处理runtime错误，避免控制台噪音
            resolve(null);
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        // 静默处理API调用异常
        resolve(null);
      }
    });
  },
  
  openOptionsPage: (): void => {
    try {
      chrome.runtime.openOptionsPage();
    } catch (error) {
      // 静默处理选项页面打开失败
    }
  }
};

// Chrome tabs API包装
export const tabs = {
  create: (url: string): void => {
    chrome.tabs.create({ url });
  },
  
  query: (queryInfo: { active: boolean; currentWindow: boolean }): Promise<any[]> => {
    return new Promise((resolve) => {
      chrome.tabs.query(queryInfo, resolve);
    });
  }
};

// 获取凭证
export const getCredentials = async (): Promise<BaiduCredentials | null> => {
  const result = await storage.sync.get(['ak', 'sk', 'apiEndpoint']);
  if (result.ak && result.sk) {
    return {
      ak: result.ak,
      sk: result.sk,
      endpoint: result.apiEndpoint || undefined
    };
  }
  return null;
};

// 保存凭证
export const saveCredentials = async (credentials: BaiduCredentials): Promise<void> => {
  await storage.sync.set({
    ak: credentials.ak,
    sk: credentials.sk,
    apiEndpoint: credentials.endpoint || ''
  });
};

// 获取任务列表
export const getTasks = async (): Promise<Task[]> => {
  const result = await storage.local.get(['tasks']);
  return result.tasks || [];
};

// 保存任务列表
export const saveTasks = async (tasks: Task[]): Promise<void> => {
  await storage.local.set({ tasks });
};

// 获取辅助配置
export const getHelperConfig = async (): Promise<AIHCXHelperConfig> => {
  const result = await storage.local.get(['helperConfig']);
  return result.helperConfig || {
    enabled: true,
    highlightImages: true,
    showImageInfo: false
  };
};

// 保存辅助配置
export const saveHelperConfig = async (config: AIHCXHelperConfig): Promise<void> => {
  await storage.local.set({ helperConfig: config });
};

// 检查用户引导是否需要显示
export const shouldShowUserGuide = async (): Promise<boolean> => {
  const result = await storage.sync.get(['hideUserGuide']);
  return !result.hideUserGuide;
};

// 隐藏用户引导
export const hideUserGuide = async (): Promise<void> => {
  await storage.sync.set({ hideUserGuide: true });
};