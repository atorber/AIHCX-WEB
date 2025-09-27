// 调试助手脚本 - 请在数据下载页面的控制台中执行
console.log('=== AIHC助手调试信息 ===');

// 1. 检查页面上的表单字段
console.log('1. 检查表单字段:');
const datasetNameInput = document.querySelector('input[placeholder="请输入数据集名称"]');
const storagePathInput = document.querySelector('input[placeholder="请输入子路径名称"]');
const openSourceInput = document.querySelector('input[placeholder="请输入开源数据集"]');

console.log('  数据集名称输入框:', datasetNameInput);
console.log('  子路径输入框:', storagePathInput);
console.log('  开源数据集输入框:', openSourceInput);

// 2. 检查Chrome扩展API
console.log('2. 检查Chrome扩展API:');
console.log('  chrome对象:', typeof chrome);
console.log('  chrome.runtime:', typeof chrome.runtime);
console.log('  chrome.tabs:', typeof chrome.tabs);

// 3. 测试消息发送
console.log('3. 测试消息发送:');
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
        type: 'FILL_DATASET_FORM',
        data: {
            datasetName: 'nvidia/PhysicalAI-SmartSpaces',
            storagePath: 'huggingface.co/datasets/nvidia/PhysicalAI-SmartSpaces'
        }
    }, (response) => {
        console.log('  消息发送响应:', response);
        if (chrome.runtime.lastError) {
            console.error('  消息发送错误:', chrome.runtime.lastError);
        }
    });
} else {
    console.error('  Chrome扩展API不可用');
}

// 4. 检查content script状态
console.log('4. 检查页面元素:');
console.log('  页面URL:', window.location.href);
console.log('  页面标题:', document.title);
console.log('  AIHC助手按钮:', document.getElementById('aihcx-helper-toggle'));

// 5. 手动测试填充
console.log('5. 手动测试填充:');
if (datasetNameInput && storagePathInput && openSourceInput) {
    const testData = {
        datasetName: 'nvidia/PhysicalAI-SmartSpaces',
        storagePath: 'huggingface.co/datasets/nvidia/PhysicalAI-SmartSpaces'
    };
    
    console.log('  开始手动填充...');
    
    // 填充数据集名称
    datasetNameInput.focus();
    datasetNameInput.value = testData.datasetName;
    datasetNameInput.dispatchEvent(new Event('input', { bubbles: true }));
    datasetNameInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // 填充子路径
    storagePathInput.focus();
    storagePathInput.value = testData.storagePath;
    storagePathInput.dispatchEvent(new Event('input', { bubbles: true }));
    storagePathInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // 填充开源数据集
    openSourceInput.focus();
    openSourceInput.value = testData.datasetName;
    openSourceInput.dispatchEvent(new Event('input', { bubbles: true }));
    openSourceInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('  手动填充完成，请检查表单是否显示了填充的内容');
    console.log('  数据集名称值:', datasetNameInput.value);
    console.log('  子路径值:', storagePathInput.value);
    console.log('  开源数据集值:', openSourceInput.value);
} else {
    console.error('  缺少必要的表单字段，无法进行手动填充测试');
}

console.log('=== 调试信息结束 ===');