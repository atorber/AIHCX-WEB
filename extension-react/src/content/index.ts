/// <reference types="chrome" />
import '../utils/errorFilter'; // 导入错误过滤器，自动启用过滤

// 检查是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development';

// 优化的日志函数，减少控制台噪音
const log = (message: string, data?: any, level: 'info' | 'warn' | 'error' = 'info') => {
  const logPrefix = '[AIHC助手]';
  const style = {
    info: 'color: #2196F3; font-weight: bold',
    warn: 'color: #FF9800; font-weight: bold', 
    error: 'color: #F44336; font-weight: bold'
  };
  
  // 只在关键操作时输出日志，避免控制台噪音
  const importantMessages = [
    '内容脚本已加载',
    '检测到AIHC控制台页面',
    '开始注入组件',
    '切换按钮已添加到DOM',
    '侧边栏面板已打开',
    '发生错误',
    '插件已被禁用'
  ];
  
  const isImportant = importantMessages.some(msg => message.includes(msg)) || level === 'error';
  
  if (isDevelopment && isImportant) {
    console.log(`%c${logPrefix} ${message}`, style[level], data || '');
  } else if (level === 'error') {
    // 生产环境只显示错误日志
    console.error(`${logPrefix} ${message}`, data || '');
  }
};

// 确保Chrome API类型可用

// 扩展上下文检查函数
const isExtensionContextValid = (): boolean => {
  try {
    // 尝试访问chrome.runtime来检查上下文是否有效
    return !!chrome.runtime && !!chrome.runtime.id;
  } catch (error) {
    return false;
  }
};

// 安全的Chrome API调用包装器
const safeChromeCall = <T>(apiCall: () => T, fallback?: T): T | undefined => {
  try {
    if (!isExtensionContextValid()) {
      console.warn('[AIHC助手] 扩展上下文已失效，跳过Chrome API调用');
      return fallback;
    }
    return apiCall();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Extension context invalidated')) {
      console.warn('[AIHC助手] 扩展上下文已失效，跳过API调用');
      return fallback;
    }
    console.error('[AIHC助手] Chrome API调用失败:', error);
    return fallback;
  }
};

interface AIHCXHelperConfig {
  enabled: boolean;
  highlightImages: boolean;
  showImageInfo: boolean;
}

// 默认配置
let config: AIHCXHelperConfig = {
  enabled: true,
  highlightImages: true,
  showImageInfo: false
};

// 从存储中加载配置
const loadConfig = () => {
  safeChromeCall(() => {
    chrome.runtime.sendMessage({ action: 'getHelperConfig' }, (response) => {
      try {
        if (response && response.config) {
          config = { ...config, ...response.config };
          if (config.enabled) {
            setupImageHelpers();
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Extension context invalidated')) {
          console.warn('[AIHC助手] 扩展上下文已失效，跳过配置加载');
          return;
        }
        console.error('[AIHC助手] 配置加载失败:', error);
      }
    });
  });
}

// 打开设置页面
const openOptionsPage = () => {
  safeChromeCall(() => {
    chrome.runtime.sendMessage({ action: 'openOptionsPage' }, (response) => {
      try {
        if (!response || !response.success) {
          console.error('打开设置页面失败');
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Extension context invalidated')) {
          console.warn('[AIHC助手] 扩展上下文已失效，跳过打开设置页面');
          return;
        }
        console.error('[AIHC助手] 打开设置页面失败:', error);
      }
    });
  });
};

// 全局变量跟踪侧边栏状态
let sidebarOpen = false;

// 主要组件注入
const injectComponent = () => {
  // 检查当前页面是否在禁用列表中
  chrome.storage.local.get(['aihcx-helper-disabled-pages'], (result) => {
    const disabledPages = result['aihcx-helper-disabled-pages'] || [];
    const currentPage = window.location.pathname;

    if (disabledPages.includes(currentPage)) {
      if (isDevelopment) {
        log('当前页面已被禁用，跳过注入');
      }
      return; // 当前页面已被禁用，不注入组件
    }

    // 创建右侧边缘切换按钮
    const toggleButton = createToggleButton();
    document.body.appendChild(toggleButton);

    // 添加悬停效果和点击交互
    addButtonInteractions(toggleButton);

    log('切换按钮已添加到DOM');
  });
};

// 创建切换按钮
const createToggleButton = () => {
  const toggleButton = document.createElement('button');
  toggleButton.id = 'aihcx-helper-toggle';
  toggleButton.title = 'AIHC助手 - 点击打开侧边栏';
  
  // 设置按钮样式，参考Vue版本
  toggleButton.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    right: 0 !important;
    transform: translateY(-50%) !important;
    width: 40px !important;
    height: 60px !important;
    background: linear-gradient(135deg, #4285f4 0%, #34a853 100%) !important;
    border: none !important;
    border-radius: 8px 0 0 8px !important;
    cursor: pointer !important;
    z-index: 9999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: -2px 0 8px rgba(66, 133, 244, 0.3) !important;
    transition: all 0.3s ease !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    color: white !important;
    font-size: 10px !important;
    font-weight: 600 !important;
    writing-mode: vertical-rl !important;
    text-orientation: mixed !important;
    letter-spacing: 1px !important;
  `;
  
  // 设置按钮文本
  toggleButton.textContent = 'AIHC';
  
  return toggleButton;
}

// 按钮交互逻辑
const addButtonInteractions = (toggleButton: HTMLElement) => {
  
  // 悬停效果，参考Vue版本
  toggleButton.addEventListener('mouseenter', () => {
    toggleButton.style.width = '50px';
    toggleButton.style.boxShadow = '-4px 0 12px rgba(66, 133, 244, 0.4)';
    toggleButton.textContent = '助手';
    toggleButton.style.fontSize = '11px';
  });

  toggleButton.addEventListener('mouseleave', () => {
    toggleButton.style.width = '40px';
    toggleButton.style.boxShadow = '-2px 0 8px rgba(66, 133, 244, 0.3)';
    toggleButton.textContent = 'AIHC';
    toggleButton.style.fontSize = '10px';
  });

  // 点击事件 - toggle侧边栏
  toggleButton.addEventListener('click', () => {
    if (sidebarOpen) {
      // 用户点击按钮但侧边栏可能已经关闭了
      // 重置状态并尝试重新打开
      log('检测到侧边栏状态不一致，尝试重新打开');

      // 重置状态为 false（因为用户可能已经手动关闭了）
      sidebarOpen = false;
      toggleButton.classList.remove('active');
      toggleButton.style.background = 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)';
      // 保持显示 'AIHC'，不切换文案

      // 尝试重新打开侧边栏
      chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
        if (response && response.success) {
          log('成功重新打开浏览器侧边栏');
          sidebarOpen = true;
          toggleButton.classList.add('active');
          toggleButton.style.background = 'linear-gradient(135deg, #34a853 0%, #4285f4 100%)';
          // 保持显示 'AIHC'，不切换文案
        } else {
          log('重新打开侧边栏失败:', response?.error || '未知错误');
          showToast('请手动点击浏览器工具栏中的插件图标打开AIHC助手', 'warning');
        }
      });
    } else {
      // 打开侧边栏
      chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
        if (response && response.success) {
          log('成功打开浏览器侧边栏');
          sidebarOpen = true;
          toggleButton.classList.add('active');
          toggleButton.style.background = 'linear-gradient(135deg, #34a853 0%, #4285f4 100%)';
          // 保持显示 'AIHC'，不切换文案
        } else {
          log('无法打开侧边栏:', response?.error || '未知错误');
          showToast('请手动点击浏览器工具栏中的插件图标来使用AIHC助手', 'warning');
        }
      });
    }
  });

  // 长按切换按钮显示关闭对话框
  let longPressTimer: number;
  toggleButton.addEventListener('mousedown', () => {
    longPressTimer = window.setTimeout(() => {
      createCloseDialog(toggleButton);
    }, 1000);
  });

  toggleButton.addEventListener('mouseup', () => {
    clearTimeout(longPressTimer);
  });

  toggleButton.addEventListener('mouseleave', () => {
    clearTimeout(longPressTimer);
  });
};

// 显示提示消息
const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    padding: 12px 20px !important;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'} !important;
    color: white !important;
    border-radius: 4px !important;
    z-index: 10001 !important;
    font-size: 14px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
    max-width: 300px !important;
    word-wrap: break-word !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    animation: slideInRight 0.3s ease !important;
  `;
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // 3秒后自动移除
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }
  }, 3000);
};

// 添加关闭确认对话框
const createCloseDialog = (toggleButton: HTMLElement) => {
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    background: white !important;
    padding: 20px !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
    z-index: 10001 !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    min-width: 400px !important;
    max-width: 90vw !important;
  `;

  dialog.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <span style="font-size: 16px; color: #333; font-weight: 500;">关闭AIHC助手</span>
      <button id="close-dialog" style="border: none; background: none; cursor: pointer; font-size: 18px; color: #999; padding: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; transition: background-color 0.2s;">
        <input type="radio" name="close-option" value="current-visit" checked style="margin: 0;">
        <span style="color: #333;">在本次访问关闭</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; transition: background-color 0.2s;">
        <input type="radio" name="close-option" value="current-page" style="margin: 0;">
        <span style="color: #333;">在本页关闭</span>
      </label>
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 4px; transition: background-color 0.2s;">
        <input type="radio" name="close-option" value="all" style="margin: 0;">
        <span style="color: #333;">全部关闭</span>
      </label>
      <div style="color: #999; font-size: 12px; margin-left: 24px;">
        可在 <a href="#" id="settings-link" style="color: #4285f4; text-decoration: none;">设置</a> 中重新开启
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 12px;">
      <button id="cancel-close" style="
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        color: #333;
        font-size: 14px;
        transition: all 0.2s;
      ">取消</button>
      <button id="confirm-close" style="
        padding: 8px 16px;
        border: none;
        background: #4285f4;
        border-radius: 4px;
        cursor: pointer;
        color: white;
        font-size: 14px;
        transition: all 0.2s;
      ">确定</button>
    </div>
  `;

  // 添加遮罩层
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: rgba(0,0,0,0.5) !important;
    z-index: 10000 !important;
  `;
  
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);

  // 事件处理
  const closeDialog = () => {
    document.body.removeChild(overlay);
    document.body.removeChild(dialog);
  };

  // 关闭弹窗按钮
  dialog.querySelector('#close-dialog')?.addEventListener('click', closeDialog);
  
  // 取消按钮
  dialog.querySelector('#cancel-close')?.addEventListener('click', closeDialog);
  
  // 点击遮罩层关闭
  overlay.addEventListener('click', closeDialog);

  // 设置链接点击事件
  dialog.querySelector('#settings-link')?.addEventListener('click', (e: Event) => {
    e.preventDefault();
    openOptionsPage();
    closeDialog();
  });

  // 确定按钮
  dialog.querySelector('#confirm-close')?.addEventListener('click', () => {
    const selectedOption = dialog.querySelector('input[name="close-option"]:checked') as HTMLInputElement;
    
    switch (selectedOption.value) {
      case 'current-visit':
        // 仅本次访问关闭，直接移除DOM
        toggleButton.remove();
        showToast('AIHC助手已在本次访问中关闭', 'info');
        break;
      
      case 'current-page':
        // 在本页关闭，保存当前页面URL
        const currentPage = window.location.pathname;
        chrome.storage.local.get(['aihcx-helper-disabled-pages'], (result) => {
          const disabledPages = result['aihcx-helper-disabled-pages'] || [];
          if (!disabledPages.includes(currentPage)) {
            disabledPages.push(currentPage);
            chrome.storage.local.set({ 'aihcx-helper-disabled-pages': disabledPages }, () => {
              toggleButton.remove();
              showToast('AIHC助手已在当前页面关闭', 'info');
            });
          } else {
            toggleButton.remove();
            showToast('AIHC助手已在当前页面关闭', 'info');
          }
        });
        break;
      
      case 'all':
        // 全部关闭，设置全局禁用标志
        chrome.storage.local.set({ 'aihcx-helper-disabled': true }, () => {
          toggleButton.remove();
          showToast('AIHC助手已全部关闭，可在设置中重新开启', 'info');
        });
        break;
    }
    
    closeDialog();
  });
};

// 图像处理辅助功能
const setupImageHelpers = () => {
  if (config.highlightImages) {
    highlightImagesOnPage();
  }
}

// 高亮页面上的图像
const highlightImagesOnPage = () => {
  const images = document.querySelectorAll('img');
  
  images.forEach((img) => {
    // 排除小图标
    if (img.width > 100 && img.height > 100) {
      // 添加边框
      img.style.border = '2px solid #4285f4';
      
      // 为图像添加点击事件
      img.addEventListener('click', (e) => {
        if (config.enabled) {
          e.preventDefault();
          e.stopPropagation();
          
          // 获取图像信息
          const imageInfo = {
            src: img.src,
            width: img.width,
            height: img.height,
            alt: img.alt || '无描述',
            pageUrl: window.location.href
          };
          
          // 发送图像信息到后台脚本
          chrome.runtime.sendMessage({ 
            action: 'processImage', 
            imageInfo 
          }, (response) => {
            if (response && response.success) {
              if (config.showImageInfo) {
                showImageInfoPopup(imageInfo);
              }
            }
          });
        }
      });
      
      // 添加悬停效果
      img.addEventListener('mouseover', () => {
        if (config.enabled) {
          img.style.cursor = 'pointer';
          img.style.boxShadow = '0 0 15px rgba(66, 133, 244, 0.5)';
        }
      });
      
      img.addEventListener('mouseout', () => {
        img.style.boxShadow = 'none';
      });
    }
  });
}

// 显示图像信息弹出层
const showImageInfoPopup = (imageInfo: any) => {
  // 创建弹出层
  const popup = document.createElement('div');
  popup.className = 'aihcx-image-info-popup';
  popup.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    background: white !important;
    padding: 20px !important;
    border-radius: 8px !important;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3) !important;
    z-index: 10000 !important;
    max-width: 80% !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
  `;
  
  // 弹出层内容
  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <h3 style="margin: 0;">图像信息</h3>
      <button id="close-popup" style="background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
    </div>
    <div style="margin-bottom: 10px;">
      <div><strong>尺寸:</strong> ${imageInfo.width}×${imageInfo.height}</div>
      <div><strong>描述:</strong> ${imageInfo.alt}</div>
      <div style="word-break: break-all;"><strong>URL:</strong> ${imageInfo.src}</div>
    </div>
    <div style="text-align: center;">
      <button id="process-image" style="padding: 8px 15px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
        添加到任务
      </button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // 关闭按钮
  document.getElementById('close-popup')?.addEventListener('click', () => {
    document.body.removeChild(popup);
  });
  
  // 处理图像按钮
  document.getElementById('process-image')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ 
      action: 'addImageToTask', 
      imageInfo 
    }, (response) => {
      if (response && response.success) {
        // 关闭弹窗
        document.body.removeChild(popup);
      }
    });
  });
}

// 检查是否为AIHC控制台页面
const isAIHCConsolePage = () => {
  return window.location.href.startsWith('https://console.bce.baidu.com/aihc');
};

// 添加CSS动画样式
const addAnimationStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
};

// 初始化内容脚本
log('内容脚本已加载，当前URL: ' + window.location.href);

const initializePlugin = () => {
  if (isAIHCConsolePage()) {
    log('检测到AIHC控制台页面');
    // 检查是否已禁用
    chrome.storage.local.get(['aihcx-helper-disabled'], (result) => {
      if (!result['aihcx-helper-disabled']) {
        log('开始注入组件');
        addAnimationStyles();
        injectComponent();
        loadConfig();
      } else {
        log('插件已被禁用');
      }
    });
  }
};

if (document.readyState === 'complete') {
  initializePlugin();
} else {
  window.addEventListener('load', initializePlugin);
}

// 监听URL变化
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    
    // 移除现有的组件（如果存在）
    const existingToggle = document.getElementById('aihcx-helper-toggle');
    
    if (existingToggle) existingToggle.remove();
    
    // 在AIHC页面重新注入组件
    if (isAIHCConsolePage()) {
      try {
        chrome.storage.local.get(['aihcx-helper-disabled'], (result) => {
          try {
            if (!result['aihcx-helper-disabled']) {
              if (isDevelopment) {
                log('URL变化，重新注入组件');
              }
              injectComponent();
              loadConfig();
            }
          } catch (error) {
            // 扩展上下文失效时的处理
            if (error instanceof Error && error.message.includes('Extension context invalidated')) {
              console.warn('[AIHC助手] 扩展上下文已失效，跳过组件注入');
              return;
            }
            console.error('[AIHC助手] 组件注入失败:', error);
          }
        });
      } catch (error) {
        // 扩展上下文失效时的处理
        if (error instanceof Error && error.message.includes('Extension context invalidated')) {
          console.warn('[AIHC助手] 扩展上下文已失效，跳过存储访问');
          return;
        }
        console.error('[AIHC助手] 存储访问失败:', error);
      }
    }
  }
}).observe(document, { subtree: true, childList: true });

// 监听来自popup或background的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  try {
    if (message.action === 'getPageInfo') {
      const pageInfo = {
        title: document.title,
        url: window.location.href,
        images: Array.from(document.querySelectorAll('img'))
          .filter(img => img.width > 100 && img.height > 100)
          .map(img => ({
            src: img.src,
            width: img.width,
            height: img.height,
            alt: img.alt || '无描述'
          }))
      };
      sendResponse(pageInfo);
    }
    
    if (message.action === 'updateConfig') {
      config = { ...config, ...message.config };
      if (config.enabled && config.highlightImages) {
        setupImageHelpers();
      }
      sendResponse({ success: true });
    }

    if (message.action === 'updateSidebarState') {
      const toggleButton = document.getElementById('aihcx-helper-toggle') as HTMLElement;
      if (toggleButton) {
        if (message.state) {
          // 侧边栏已打开
          sidebarOpen = true;
          toggleButton.classList.add('active');
          toggleButton.style.background = 'linear-gradient(135deg, #34a853 0%, #4285f4 100%)';
          toggleButton.textContent = '已开';
          log('侧边栏状态更新为已打开');
        } else {
          // 侧边栏已关闭
          sidebarOpen = false;
          toggleButton.classList.remove('active');
          toggleButton.style.background = 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)';
          toggleButton.textContent = 'AIHC';
          log('侧边栏状态更新为已关闭');
        }
      }
      sendResponse({ success: true });
    }

    // 处理表单填充消息（数据集和模型）
    if (message.type === 'FILL_FORM') {
      console.log('[AIHC助手] 收到表单填充请求:', message.data);
      
      try {
        const data = message.data;
        
        // 通用字段填充函数 - 适配React输入框
        const fillField = (fieldName: string, value: string) => {
          const field = document.querySelector(`[data-name="${fieldName}"] input`) as HTMLInputElement;
          if (field) {
            // 使用React兼容的填充方法
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(field, value);
            } else {
              field.value = value;
            }
            
            // 创建React合成事件
            const inputEvent = new Event('input', { bubbles: true });
            const changeEvent = new Event('change', { bubbles: true });
            
            // 触发事件序列
            field.focus();
            field.dispatchEvent(inputEvent);
            field.dispatchEvent(changeEvent);
            field.blur();
            
            console.log(`[AIHC助手] ✅ 字段 ${fieldName} 已填充:`, value);
            return true;
          } else {
            console.warn(`[AIHC助手] ❌ 未找到字段 ${fieldName}`);
            return false;
          }
        };
        
        // React输入框填充函数（用于placeholder选择器）
        const fillReactInput = (selector: string, value: string, description: string) => {
          const field = document.querySelector(selector) as HTMLInputElement;
          if (field && value) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(field, value);
            } else {
              field.value = value;
            }
            
            const inputEvent = new Event('input', { bubbles: true });
            const changeEvent = new Event('change', { bubbles: true });
            
            field.focus();
            field.dispatchEvent(inputEvent);
            field.dispatchEvent(changeEvent);
            field.blur();
            
            console.log(`[AIHC助手] ✅ ${description}已填充:`, value);
            return true;
          } else {
            console.warn(`[AIHC助手] ❌ 未找到${description}字段`);
            return false;
          }
        };
        
        let successCount = 0;
        
        // 1. 切换创建内容类型（数据集/模型）
        if (data.type) {
          const typeRadios = document.querySelectorAll('input[type="radio"][value="DATASET"], input[type="radio"][value="MODEL"]');
          console.log('[AIHC助手] 找到类型单选按钮:', typeRadios.length);
          
          typeRadios.forEach((radio: any) => {
            if (radio.value === data.type) {
              console.log(`[AIHC助手] 尝试切换到${data.type === 'DATASET' ? '数据集' : '模型'}`);
              
              // 先取消所有选中状态
              typeRadios.forEach((r: any) => r.checked = false);
              
              // 设置目标选项为选中
              radio.checked = true;
              
              // 触发多种事件确保切换生效
              radio.dispatchEvent(new Event('change', { bubbles: true }));
              radio.dispatchEvent(new Event('click', { bubbles: true }));
              radio.dispatchEvent(new Event('input', { bubbles: true }));
              
              // 同时触发父元素的点击事件
              const label = radio.closest('label');
              if (label) {
                label.click();
              }
              
              console.log(`[AIHC助手] 已选择${data.type === 'DATASET' ? '数据集' : '模型'}，当前checked:`, radio.checked);
              successCount++;
            }
          });
        }

        // 等待页面更新后再填充字段
        setTimeout(() => {
          console.log('[AIHC助手] 开始填充字段...');
          
          // 2. 填充名称字段（数据集名称/模型名称都使用同一个data-name="datasetName"）
          const nameValue = data.type === 'DATASET' ? data.datasetName : data.modelName;
          if (nameValue) {
            console.log(`[AIHC助手] 填充${data.type === 'DATASET' ? '数据集' : '模型'}名称:`, nameValue);
            if (fillField('datasetName', nameValue)) {
              successCount++;
            }
          }

          // 3. 填充子路径名称字段
          if (data.storagePath) {
            console.log('[AIHC助手] 填充子路径名称:', data.storagePath);
            if (fillReactInput('input[placeholder="请输入子路径名称"]', data.storagePath, '子路径名称')) {
              successCount++;
            }
          }

          // 4. 填充开源地址字段
          const sourceValue = data.type === 'DATASET' ? data.openSourceDataset : data.openSourceModel;
          if (sourceValue) {
            console.log(`[AIHC助手] 填充开源${data.type === 'DATASET' ? '数据集' : '模型'}地址:`, sourceValue);
            if (fillField('datasetSourceUri', sourceValue)) {
              successCount++;
            }
          }
          
          console.log(`[AIHC助手] 🎉 表单填充完成！成功填充了 ${successCount} 个字段`);
          sendResponse({ 
            success: successCount > 0, 
            filledCount: successCount
          });
        }, 2000); // 增加等待时间确保页面更新完成
        
      } catch (error) {
        console.error('[AIHC助手] ❌ 表单填充失败:', error);
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
      
      return true; // 保持消息通道开放以支持异步响应
    }

    // 保持旧的数据集表单填充消息兼容性
    if (message.type === 'FILL_DATASET_FORM') {
      console.log('[AIHC助手] 收到旧版数据集表单填充请求:', message.data);
      
      try {
        const { datasetName, storagePath } = message.data;
        let successCount = 0;
        
        // 填充数据集名称
        const datasetNameInput = document.querySelector('input[placeholder="请输入数据集名称"]') as HTMLInputElement;
        if (datasetNameInput) {
          datasetNameInput.focus();
          datasetNameInput.value = datasetName;
          datasetNameInput.dispatchEvent(new Event('input', { bubbles: true }));
          datasetNameInput.dispatchEvent(new Event('change', { bubbles: true }));
          successCount++;
          console.log('[AIHC助手] ✅ 数据集名称已填充:', datasetName);
        } else {
          console.warn('[AIHC助手] ❌ 未找到数据集名称输入框');
        }
        
        // 填充存储子路径
        const storagePathInput = document.querySelector('input[placeholder="请输入子路径名称"]') as HTMLInputElement;
        if (storagePathInput) {
          storagePathInput.focus();
          storagePathInput.value = storagePath;
          storagePathInput.dispatchEvent(new Event('input', { bubbles: true }));
          storagePathInput.dispatchEvent(new Event('change', { bubbles: true }));
          successCount++;
          console.log('[AIHC助手] ✅ 存储子路径已填充:', storagePath);
        } else {
          console.warn('[AIHC助手] ❌ 未找到存储子路径输入框');
        }
        
        // 填充开源数据集地址
        const openSourceInput = document.querySelector('input[placeholder="请输入开源数据集"]') as HTMLInputElement;
        if (openSourceInput) {
          openSourceInput.focus();
          openSourceInput.value = datasetName; // 注意：这里应该是datasetName，不是完整URL
          openSourceInput.dispatchEvent(new Event('input', { bubbles: true }));
          openSourceInput.dispatchEvent(new Event('change', { bubbles: true }));
          successCount++;
          console.log('[AIHC助手] ✅ 开源数据集地址已填充:', datasetName);
        } else {
          console.warn('[AIHC助手] ❌ 未找到开源数据集输入框');
        }
        
        console.log(`[AIHC助手] 🎉 表单填充完成！成功填充了 ${successCount}/3 个字段`);
        sendResponse({ 
          success: successCount > 0, 
          filledCount: successCount,
          totalCount: 3
        });
        
      } catch (error) {
        console.error('[AIHC助手] ❌ 表单填充失败:', error);
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
      
      return true; // 保持消息通道开放以支持异步响应
    }

    return true;
  } catch (error) {
    // 扩展上下文失效时的处理
    if (error instanceof Error && error.message.includes('Extension context invalidated')) {
      console.warn('[AIHC助手] 扩展上下文已失效，消息处理中断');
      return false;
    }
    console.error('[AIHC助手] 消息处理失败:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : '未知错误' });
    return false;
  }
})