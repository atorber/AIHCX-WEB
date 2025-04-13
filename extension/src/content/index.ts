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

// 主要组件注入
const injectComponent = () => {
  // 创建辅助按钮
  const button = document.createElement('button');
  button.id = 'aihcx-helper-button';
  button.textContent = 'AIHCX助手';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 15px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    z-index: 9999;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  
  button.addEventListener('click', () => {
    // 发送消息到插件，开启插件弹出窗口
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
  
  document.body.appendChild(button);
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

// 初始化内容脚本
if (document.readyState === 'complete') {
  injectComponent();
  loadConfig();
} else {
  window.addEventListener('load', () => {
    injectComponent();
    loadConfig();
  });
}

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