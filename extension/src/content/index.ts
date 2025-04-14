// 确保Chrome API类型可用
declare const chrome: {
  runtime: {
    onMessage: {
      addListener: (
        callback: (
          message: any, 
          sender: any, 
          sendResponse: (response?: any) => void
        ) => boolean | void
      ) => void
    },
    sendMessage: (message: any, callback?: (response: any) => void) => void
  },
  storage: {
    local: {
      get: (keys: string[], callback: (result: any) => void) => void,
      set: (items: { [key: string]: any }, callback?: () => void) => void
    }
  }
}

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

// 创建关闭确认弹窗
const createCloseDialog = (container: HTMLElement) => {
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-width: 400px;
  `;

  dialog.innerHTML = `
    <style>
      .aihcx-radio {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
      
      .aihcx-radio input[type="radio"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .aihcx-radio .radio-custom {
        width: 16px;
        height: 16px;
        border: 2px solid #ddd;
        border-radius: 50%;
        display: inline-block;
        position: relative;
      }
      
      .aihcx-radio input[type="radio"]:checked + .radio-custom {
        border-color: #4285f4;
      }
      
      .aihcx-radio input[type="radio"]:checked + .radio-custom::after {
        content: '';
        width: 8px;
        height: 8px;
        background: #4285f4;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
      }
      
      .aihcx-radio:hover .radio-custom {
        border-color: #4285f4;
      }
    </style>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <span style="font-size: 16px; color: #333;">关闭悬浮按钮</span>
      <button id="close-dialog" style="border: none; background: none; cursor: pointer; font-size: 18px; color: #999;">×</button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <label class="aihcx-radio">
        <input type="radio" name="close-option" value="current-visit" checked>
        <span class="radio-custom"></span>
        <span style="color: #333;">在本次访问关闭</span>
      </label>
      <label class="aihcx-radio">
        <input type="radio" name="close-option" value="current-page">
        <span class="radio-custom"></span>
        <span style="color: #333;">在本页关闭</span>
      </label>
      <label class="aihcx-radio">
        <input type="radio" name="close-option" value="all">
        <span class="radio-custom"></span>
        <span style="color: #333;">全部关闭</span>
      </label>
      <div style="color: #999; font-size: 12px; margin-left: 24px;">
        可在 <a href="#" id="settings-link" style="color: #4285f4; text-decoration: none;">设置</a> 中开启
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
      <button id="cancel-close" style="
        padding: 6px 16px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        color: #333;
      ">取消</button>
      <button id="confirm-close" style="
        padding: 6px 16px;
        border: none;
        background: #4285f4;
        border-radius: 4px;
        cursor: pointer;
        color: white;
      ">确定</button>
    </div>
  `;

  document.body.appendChild(dialog);

  // 事件处理
  const closeDialog = () => {
    document.body.removeChild(dialog);
  };

  // 关闭弹窗按钮
  dialog.querySelector('#close-dialog')?.addEventListener('click', closeDialog);
  
  // 取消按钮
  dialog.querySelector('#cancel-close')?.addEventListener('click', closeDialog);

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
        container.remove();
        break;
      
      case 'current-page':
        // 在本页关闭，保存当前页面URL
        const currentPage = window.location.pathname;
        chrome.storage.local.get(['aihcx-helper-disabled-pages'], (result) => {
          const disabledPages = result['aihcx-helper-disabled-pages'] || [];
          if (!disabledPages.includes(currentPage)) {
            disabledPages.push(currentPage);
            chrome.storage.local.set({ 'aihcx-helper-disabled-pages': disabledPages }, () => {
              container.remove();
            });
          } else {
            container.remove();
          }
        });
        break;
      
      case 'all':
        // 全部关闭，设置全局禁用标志
        chrome.storage.local.set({ 'aihcx-helper-disabled': true }, () => {
          container.remove();
        });
        break;
    }
    
    closeDialog();
  });
};

// 主要组件注入
const injectComponent = () => {
  // 检查当前页面是否在禁用列表中
  chrome.storage.local.get(['aihcx-helper-disabled-pages'], (result) => {
    const disabledPages = result['aihcx-helper-disabled-pages'] || [];
    const currentPage = window.location.pathname;
    
    if (disabledPages.includes(currentPage)) {
      return; // 当前页面已被禁用，不注入组件
    }
    
    // 创建主容器
    const container = document.createElement('div');
    container.id = 'aihcx-helper-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      background-color: #4285f4;
      border-radius: 4px;
      cursor: move;
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      z-index: 9999;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      user-select: none;
    `;

    // 创建主按钮
    const button = document.createElement('button');
    button.id = 'aihcx-helper-button';
    button.textContent = 'AIHC助手';
    button.style.cssText = `
      padding: 10px 15px;
      background: none;
      color: white;
      border: none;
      cursor: pointer;
      font-family: inherit;
    `;

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.id = 'aihcx-helper-close';
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      padding: 10px;
      background: none;
      color: white;
      border: none;
      border-left: 1px solid rgba(255,255,255,0.2);
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
    `;

    // 添加按钮点击事件
    button.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation(); // 防止触发拖动
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });

    // 修改关闭按钮点击事件
    closeButton.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      createCloseDialog(container);
    });

    // 添加拖动功能
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    const dragStart = (e: MouseEvent) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      if (e.target === container || e.target === button) {
        isDragging = true;
      }
    };

    const drag = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        container.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    };

    const dragEnd = () => {
      if (isDragging) {
        isDragging = false;
        // 保存位置到存储中
        chrome.storage.local.set({
          'aihcx-helper-position': { x: xOffset, y: yOffset }
        });
      }
    };

    // 从存储中恢复位置
    chrome.storage.local.get(['aihcx-helper-position'], (result: { [key: string]: any }) => {
      if (result['aihcx-helper-position']) {
        const { x, y } = result['aihcx-helper-position'];
        xOffset = x;
        yOffset = y;
        container.style.transform = `translate(${x}px, ${y}px)`;
      }
    });

    container.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // 组装组件
    container.appendChild(button);
    container.appendChild(closeButton);
    document.body.appendChild(container);
  });
}

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
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 80%;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
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

// 初始化内容脚本
if (document.readyState === 'complete') {
  if (isAIHCConsolePage()) {
    // 检查是否已禁用
    chrome.storage.local.get(['aihcx-helper-disabled'], (result) => {
      if (!result['aihcx-helper-disabled']) {
        injectComponent();
        loadConfig();
      }
    });
  }
} else {
  window.addEventListener('load', () => {
    if (isAIHCConsolePage()) {
      // 检查是否已禁用
      chrome.storage.local.get(['aihcx-helper-disabled'], (result) => {
        if (!result['aihcx-helper-disabled']) {
          injectComponent();
          loadConfig();
        }
      });
    }
  });
}

// 监听URL变化
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    
    // 移除现有的按钮（如果存在）
    const existingContainer = document.getElementById('aihcx-helper-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // 在AIHC页面重新注入按钮
    if (isAIHCConsolePage()) {
      chrome.storage.local.get(['aihcx-helper-disabled'], (result) => {
        if (!result['aihcx-helper-disabled']) {
          injectComponent();
          loadConfig();
        }
      });
    }
  }
}).observe(document, { subtree: true, childList: true });

// 监听来自popup或background的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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