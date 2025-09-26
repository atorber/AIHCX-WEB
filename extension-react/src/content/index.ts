/// <reference types="chrome" />

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

// 过滤第三方库的警告信息
if (!isDevelopment) {
  const originalConsoleWarn = console.warn;
  console.warn = function(...args: any[]) {
    const message = args.join(' ');
    // 过滤掉TrackRoute嵌套警告和其他第三方库警告
    if (message.includes('TrackRoute') && message.includes('nested') ||
        message.includes('Tracert before fns') ||
        message.includes('stop propagation') ||
        message.includes('Portal Assistant loaded')) {
      return; // 静默处理这些警告
    }
    originalConsoleWarn.apply(console, args);
  };
}

// 确保Chrome API类型可用

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
  chrome.runtime.sendMessage({ action: 'getHelperConfig' }, (response) => {
    if (response && response.config) {
      config = { ...config, ...response.config };
      if (config.enabled) {
        setupImageHelpers();
      }
    }
  });
}

// 打开设置页面
const openOptionsPage = () => {
  chrome.runtime.sendMessage({ action: 'openOptionsPage' }, (response) => {
    if (!response || !response.success) {
      console.error('打开设置页面失败');
    }
  });
};

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
  toggleButton.innerHTML = '🔧';
  toggleButton.title = 'AIHC助手 - 点击打开侧边栏';
  
  // 设置按钮样式
  toggleButton.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    right: 0 !important;
    transform: translateY(-50%) !important;
    width: 48px !important;
    height: 48px !important;
    background: #4285f4 !important;
    color: white !important;
    border: none !important;
    border-radius: 8px 0 0 8px !important;
    cursor: pointer !important;
    z-index: 10000 !important;
    font-size: 18px !important;
    box-shadow: -2px 0 8px rgba(0,0,0,0.2) !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
  `;
  
  return toggleButton;
}

// 按钮交互逻辑
const addButtonInteractions = (toggleButton: HTMLElement) => {
  // 悬停效果
  toggleButton.addEventListener('mouseenter', () => {
    toggleButton.style.transform = 'translateY(-50%) translateX(-8px)';
    toggleButton.style.background = '#3367d6';
  });
  
  toggleButton.addEventListener('mouseleave', () => {
    toggleButton.style.transform = 'translateY(-50%)';
    toggleButton.style.background = '#4285f4';
  });

  // 切换按钮点击事件 - 由于用户手势限制，引导用户点击插件图标
  toggleButton.addEventListener('click', () => {
    // 显示提示信息
    showToast('请点击浏览器工具栏中的 AIHC助手 图标来打开侧边栏', 'info');
    
    // 添加视觉反馈
    toggleButton.style.background = '#ff9800';
    toggleButton.style.transform = 'translateY(-50%) scale(1.1)';
    
    // 2秒后恢复原始状态
    setTimeout(() => {
      toggleButton.style.background = '#4285f4';
      toggleButton.style.transform = 'translateY(-50%)';
    }, 2000);
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
      chrome.storage.local.get(['aihcx-helper-disabled'], (result) => {
        if (!result['aihcx-helper-disabled']) {
          if (isDevelopment) {
            log('URL变化，重新注入组件');
          }
          injectComponent();
          loadConfig();
        }
      });
    }
  }
}).observe(document, { subtree: true, childList: true });

// 监听来自popup或background的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
  
  return true;
})