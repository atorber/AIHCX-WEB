// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getCurrentUrl') {
        // 使用 Promise 包装异步操作
        new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                
                if (tabs[0] && tabs[0].url) {
                    resolve({ url: tabs[0].url });
                } else {
                    reject('无法获取当前标签页');
                }
            });
        })
        .then(response => {
            sendResponse(response);
        })
        .catch(error => {
            sendResponse({ error: error });
        });
        
        // 返回 true 表示我们将异步发送响应
        return true;
    } else if (request.type === 'openPopup') {
        chrome.windows.create({
            url: chrome.runtime.getURL('src/popup/index.html'),
            type: 'popup',
            width: 400,
            height: 600
        });
    }
    
    // 对于其他类型的消息，确保返回 false
    return false;
});

// 监听标签页URL变化
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        // 通知所有popup页面URL已变化
        chrome.runtime.sendMessage({ type: 'urlChanged', url: changeInfo.url });
    }
}); 