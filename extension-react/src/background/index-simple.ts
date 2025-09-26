/// <reference types="chrome" />

console.log('[AIHC助手] 极简Background Script 启动');

// 最简化的点击事件处理
chrome.action.onClicked.addListener((tab) => {
  console.log('[AIHC助手] 图标被点击');
  console.log('[AIHC助手] 标签页ID:', tab.id, '窗口ID:', tab.windowId);
  
  if (!tab.windowId) {
    console.error('[AIHC助手] 无效的窗口ID');
    return;
  }
  
  console.log('[AIHC助手] 立即尝试打开侧边栏');
  
  // 立即同步调用，不使用任何异步操作
  chrome.sidePanel.open({ windowId: tab.windowId })
    .then(() => console.log('[AIHC助手] 侧边栏打开成功'))
    .catch((err) => {
      console.error('[AIHC助手] 侧边栏打开失败:', err.message);
      console.log('[AIHC助手] 尝试显示错误通知');
      
      // 简单的错误通知
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'assets/icons/icon48.png',
          title: 'AIHC助手',
          message: `无法打开侧边栏: ${err.message}`
        });
      }
    });
});

// 基础安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('[AIHC助手] 插件已安装');
});

// 添加消息监听器，防止runtime.lastError错误
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // 静默处理消息，避免控制台噪音
  try {
    if (message && message.action) {
      sendResponse({ success: true, message: '消息已收到' });
    } else {
      sendResponse({ success: false, message: '未知消息格式' });
    }
  } catch (error) {
    // 静默处理消息处理错误
    sendResponse({ success: false, message: '消息处理失败' });
  }
  
  // 返回true表示异步响应
  return true;
});

console.log('[AIHC助手] 极简Background Script 初始化完成');