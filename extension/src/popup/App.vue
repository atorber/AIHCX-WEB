<template>
    <div class="popup-container">
        <div class="header">
            <h1 style="text-align: left;">AIHC助手</h1>
            <p style="text-align: left;">{{ curPage }}</p>
            <div v-if="isSupportedPage" class="tabs">
                <button :class="{ active: activeTab === 'cli' }" @click="activeTab = 'cli'">CLI命令</button>
                <button :class="{ active: activeTab === 'json' }" @click="activeTab = 'json'">JSON格式参数</button>
                <button :class="{ active: activeTab === 'yaml' }" @click="activeTab = 'yaml'">YAML格式参数</button>
            </div>
        </div>

        <template v-if="isSupportedPage">
            <!-- CLI命令选项卡 -->
            <div v-if="activeTab === 'cli'" class="tab-content">
                <div v-if="taskParams.generated" class="result-container">
                    <h3>生成的CLI命令</h3>
                    <pre>{{ taskParams.generated }}</pre>
                    <button @click="copyToClipboard">复制到粘贴板</button>
                </div>
            </div>

            <!-- JSON格式选项卡 -->
            <div v-if="activeTab === 'json'" class="tab-content">
                <div v-if="taskParams.generated" class="result-container">
                    <h3>生成的JSON参数</h3>
                    <pre>{{ taskParams.generated }}</pre>
                    <button @click="copyToClipboard">复制到粘贴板</button>
                </div>
            </div>

            <!-- YAML格式选项卡 -->
            <div v-if="activeTab === 'yaml'" class="tab-content">
                <div v-if="taskParams.generated" class="result-container">
                    <h3>生成的YAML参数</h3>
                    <pre>{{ taskParams.generated }}</pre>
                    <button @click="copyToClipboard">复制到粘贴板</button>
                </div>
            </div>
        </template>

        <div v-else class="unsupported-page">
            <ul class="supported-pages">
                <li v-for="(name, url) in urlList" :key="url">
                    {{ name }}
                </li>
            </ul>
        </div>

        <div v-if="message" class="message" :class="message.type">
            {{ message.text }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'

// Chrome API 类型定义
declare const chrome: {
    runtime: {
        sendMessage: (message: any, callback?: (response: any) => void) => void;
        openOptionsPage: () => void;
        onMessage: {
            addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void) => void;
        };
        lastError?: {
            message: string;
        };
    },
    storage: {
        sync: {
            get: (keys: string[], callback: (result: Record<string, any>) => void) => void;
        }
    },
    tabs: {
        query: (queryInfo: { active: boolean, currentWindow: boolean }, callback: (tabs: any[]) => void) => void;
        onUpdated: {
            addListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
        }
    }
}

// 状态
const activeTab = ref('cli')
const isConfigured = ref(false)
const message = ref<{ type: string, text: string } | null>(null)

const curPage = ref('不支持当前页面，支持的页面列表：')

const urlList = {
    'https://console.bce.baidu.com/aihc/infoTaskIndex/detail?': '任务详情',
    'https://console.bce.baidu.com/aihc/resources': '资源池列表',
    'https://console.bce.baidu.com/aihc/tasks?': '任务列表'
}

// 添加调试信息
const debugLog = (message: string, data?: any) => {
    console.log(`[AIHCX Debug] ${message}`, data || '');
}

interface UrlResponse {
    url?: string;
    error?: string;
}

const checkCurPage = () => {
    debugLog('开始检查当前页面')
    
    // 直接使用 chrome.tabs.query 获取当前标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
            debugLog('获取标签页时出错:', chrome.runtime.lastError.message)
            curPage.value = chrome.runtime.lastError.message
            return
        }
        
        if (!tabs || tabs.length === 0) {
            debugLog('未找到活动标签页')
            curPage.value = '无法获取当前标签页'
            return
        }
        
        const currentUrl = tabs[0].url
        debugLog('当前URL', currentUrl)
        
        if (!currentUrl) {
            debugLog('当前标签页没有URL')
            curPage.value = '无法获取页面URL'
            return
        }
        
        let matched = false
        for (const [key, value] of Object.entries(urlList)) {
            debugLog(`尝试匹配URL模式`, key)
            
            if (currentUrl.startsWith(key)) {
                debugLog(`匹配成功`, { pattern: key, page: value })
                curPage.value = value
                matched = true
                break
            }
        }
        
        if (!matched) {
            debugLog('未找到匹配的URL模式')
            curPage.value = '不支持当前页面，支持的页面列表：'
        }
    });
}

// 修改URL变化监听
const observeUrlChanges = () => {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.url) {
            debugLog('URL发生变化', changeInfo.url)
            checkCurPage()
        }
    })
}

// 在组件挂载时启动URL监听
onMounted(() => {
    debugLog('组件挂载')
    checkConfiguration()
    checkCurPage()
    generateParams()
    observeUrlChanges()
})

const checkConfiguration = () => {
    chrome.storage.sync.get(['ak', 'sk'], (result) => {
        isConfigured.value = !!(result.ak && result.sk)
    })
}

// 任务参数
const taskParams = reactive({
    type: 'ocr',
    dataSource: 'local',
    priority: 'medium',
    customParams: '',
    generated: ''
})

// 功能方法
const openOptions = () => {
    chrome.runtime.openOptionsPage()
}

const generateParams = () => {
    // 准备要发送的数据
    const data = {
        type: taskParams.type,
        dataSource: taskParams.dataSource,
        priority: taskParams.priority
    }

    if (taskParams.type === 'custom' && taskParams.customParams) {
        try {
            const customParams = JSON.parse(taskParams.customParams)
            Object.assign(data, { custom: customParams })
        } catch (e) {
            showMessage('error', '自定义参数JSON格式不正确')
            return
        }
    }

    // 根据当前选中的标签页生成不同格式的参数
    let generatedContent = ''
    switch (activeTab.value) {
        case 'cli':
            generatedContent = generateCLICommand(data)
            break
        case 'json':
            generatedContent = JSON.stringify(data, null, 2)
            break
        case 'yaml':
            generatedContent = generateYAML(data)
            break
    }

    taskParams.generated = generatedContent
}

const generateCLICommand = (data: any) => {
    const command = ['aihcx']

    // 添加基本参数
    command.push(`--type ${data.type}`)
    command.push(`--source ${data.dataSource}`)
    command.push(`--priority ${data.priority}`)

    // 添加自定义参数
    if (data.custom) {
        Object.entries(data.custom).forEach(([key, value]) => {
            command.push(`--${key} ${value}`)
        })
    }

    return command.join(' ')
}

const generateYAML = (data: any) => {
    const yamlLines = []

    // 添加基本参数
    yamlLines.push(`type: ${data.type}`)
    yamlLines.push(`source: ${data.dataSource}`)
    yamlLines.push(`priority: ${data.priority}`)

    // 添加自定义参数
    if (data.custom) {
        yamlLines.push('custom:')
        Object.entries(data.custom).forEach(([key, value]) => {
            yamlLines.push(`  ${key}: ${value}`)
        })
    }

    return yamlLines.join('\n')
}

const copyToClipboard = () => {
    navigator.clipboard.writeText(taskParams.generated)
        .then(() => {
            showMessage('success', '已复制到剪贴板')
        })
        .catch(err => {
            console.error('无法复制文本: ', err)
            showMessage('error', '复制失败')
        })
}

const showMessage = (type: 'success' | 'error', text: string) => {
    message.value = { type, text }
    setTimeout(() => {
        message.value = null
    }, 3000)
}

// 添加 watch 监听参数变化
watch([() => taskParams.type, () => taskParams.dataSource, () => taskParams.priority, () => taskParams.customParams], () => {
    generateParams()
})

// 计算属性：判断当前页面是否支持
const isSupportedPage = computed(() => {
    return curPage.value !== '不支持当前页面，支持的页面列表：' && curPage.value !== '无法获取页面信息' && curPage.value !== '无法获取当前标签页' && curPage.value !== '无法获取页面URL'
})
</script>

<style>
.popup-container {
    width: 380px;
    max-height: 600px;
    padding: 16px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #333;
}

.header {
    margin-bottom: 16px;
}

.header h1 {
    margin: 0 0 12px 0;
    font-size: 18px;
    text-align: center;
}

.tabs {
    display: flex;
    border-bottom: 1px solid #eee;
}

.tabs button {
    flex: 1;
    padding: 8px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 14px;
}

.tabs button.active {
    color: #4285f4;
    border-bottom-color: #4285f4;
    font-weight: 500;
}

.tab-content {
    padding: 16px 0;
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
}

.form-group select,
.form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
}

.form-group textarea {
    resize: vertical;
}

.form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
}

.form-actions button {
    padding: 8px 16px;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.form-actions button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.warning-message {
    margin: 16px 0;
    padding: 10px;
    background: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
    border-radius: 4px;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.message {
    margin: 16px 0;
    padding: 10px;
    border-radius: 4px;
    font-size: 13px;
}

.message.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.link-button {
    background: none;
    border: none;
    color: #4285f4;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    font-size: 13px;
}

.result-container {
    margin-top: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 4px;
}

.result-container h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
}

.result-container pre {
    margin: 0 0 8px 0;
    white-space: pre-wrap;
    font-size: 12px;
    background: #fff;
    border: 1px solid #eee;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
}

.result-container button {
    padding: 6px 12px;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.task-list-actions {
    margin-bottom: 16px;
}

.task-list-actions button {
    padding: 8px 16px;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.task-list-actions button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

.empty-list {
    text-align: center;
    padding: 20px;
    color: #999;
    font-size: 14px;
}

.task-item {
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 4px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
}

.task-title {
    font-weight: 500;
    margin-bottom: 4px;
    font-size: 14px;
}

.task-type,
.task-date {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
}

.task-status {
    font-size: 12px;
    margin-bottom: 4px;
}

.task-status.completed {
    color: #28a745;
}

.task-status.processing {
    color: #007bff;
}

.task-status.pending {
    color: #6c757d;
}

.task-status.failed {
    color: #dc3545;
}

.task-status.cancelled {
    color: #6c757d;
}

.task-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.action-button {
    margin-bottom: 4px;
    padding: 4px 8px;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.action-button.cancel {
    background: #dc3545;
}

.task-detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.task-detail {
    width: 350px;
    max-height: 550px;
    background: white;
    border-radius: 8px;
    padding: 16px;
    position: relative;
    overflow-y: auto;
}

.close-button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
}

.task-detail h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    text-align: center;
}

.detail-item {
    margin-bottom: 12px;
}

.detail-item strong {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
}

.detail-item pre {
    margin: 0;
    white-space: pre-wrap;
    font-size: 12px;
    background: #f8f9fa;
    border: 1px solid #eee;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
}

.debug-messages {
    margin-top: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 4px;
}

.debug-messages h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
}

.debug-messages div {
    margin-bottom: 8px;
    font-size: 12px;
}

.unsupported-page {
    padding: 16px;
    text-align: left;
}

.unsupported-page h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #666;
}

.supported-pages {
    list-style: none;
    padding: 0;
    margin: 0;
}

.supported-pages li {
    margin-bottom: 8px;
}

.supported-pages a {
    color: #4285f4;
    text-decoration: none;
    font-size: 13px;
}

.supported-pages a:hover {
    text-decoration: underline;
}
</style>