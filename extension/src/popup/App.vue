<template>
    <div class="popup-container">
        <!-- 用户引导 -->
        <UserGuide />
        
        <div class="header">
            <h1 style="text-align: left;">AIHC助手</h1>
        </div>

        <template v-if="isSupportedPage">
            <p style="text-align: left;">{{ curPage }}</p>
            
            <!-- 加载指示器 -->
            <div v-if="isLoading" class="loading-indicator">
                <div class="loading-spinner"></div>
                <span>正在加载...</span>
            </div>
            
            <div v-if="isSupportedPage && !isLoading" class="tabs">
                <button v-if="taskParams.cliItems.length > 0" :class="{ active: activeTab === 'cli' }"
                    @click="activeTab = 'cli'">CLI命令</button>
                <button v-if="taskParams.commandScript" :class="{ active: activeTab === 'commandScript' }"
                    @click="activeTab = 'commandScript'">启动命令</button>
                <button v-if="taskParams.jsonItems.length > 0" :class="{ active: activeTab === 'json' }"
                    @click="activeTab = 'json'">JSON参数</button>
                <button v-if="taskParams.yamlItems.length > 0" :class="{ active: activeTab === 'yaml' }"
                    @click="activeTab = 'yaml'">YAML参数</button>
                <button v-if="taskParams.apiDocs.length > 0" :class="{ active: activeTab === 'apiDocs' }"
                    @click="activeTab = 'apiDocs'">API文档</button>
            </div>
            
            <!-- CLI命令选项卡 -->
            <div v-if="activeTab === 'cli'" class="tab-content">
                <div v-if="taskParams.cliItems.length > 0" class="result-container">
                    <div v-for="item in taskParams.cliItems" :key="item.title" class="result-item">
                        <h3 style="display: flex; justify-content: space-between;">
                            {{ item.title }}
                            <span style="margin-left: 10px;">
                                <button @click="(e) => copyToClipboard(item.text, e.target as HTMLElement)">复制命令到剪贴板</button>
                                <button style="margin-left: 10px;" v-if="item.doc"
                                    @click="openUrl(item.doc)">CLI使用手册</button>
                            </span>
                        </h3>
                        <pre>{{ item.text }}</pre>
                    </div>
                </div>
            </div>

            <!-- 启动命令选项卡 -->
            <div v-if="activeTab === 'commandScript'" class="tab-content">
                <div v-if="taskParams.commandScript" class="result-container">
                    <div class="result-item">
                        <h3 style="display: flex; justify-content: space-between;">
                            任务启动命令
                            <span style="margin-left: 10px;">
                                <button @click="(e) => copyToClipboard(taskParams.commandScript, e.target as HTMLElement)">复制到剪贴板</button>
                                <button style="margin-left: 10px;" @click="saveToFile(taskParams.commandScript, 'txt')">保存为文件</button>
                            </span>
                        </h3>
                        <pre>{{ taskParams.commandScript }}</pre>
                    </div>
                </div>
            </div>

            <!-- JSON格式选项卡 -->
            <div v-if="activeTab === 'json'" class="tab-content">
                <div v-if="taskParams.jsonItems.length > 0" class="result-container">
                    <div v-for="item in taskParams.jsonItems" :key="item.title" class="result-item">
                        <h3 style="display: flex; justify-content: space-between;">
                            {{ item.title }}
                            <span style="margin-left: 10px;">
                                <button @click="(e) => copyToClipboard(item.text, e.target as HTMLElement)">复制到剪贴板</button>
                                <button style="margin-left: 10px;" @click="saveToFile(item.text, 'json')">保存为文件</button>
                            </span>
                        </h3>
                        <pre>{{ item.text }}</pre>
                    </div>
                </div>
            </div>

            <!-- YAML格式选项卡 -->
            <div v-if="activeTab === 'yaml'" class="tab-content">
                <div v-if="taskParams.yamlItems.length > 0" class="result-container">
                    <div v-for="item in taskParams.yamlItems" :key="item.title" class="result-item">
                        <h3 style="display: flex; justify-content: space-between;">
                            {{ item.title }}
                            <span style="margin-left: 10px;">
                                <button @click="(e) => copyToClipboard(item.text, e.target as HTMLElement)">复制到剪贴板</button>
                                <button style="margin-left: 10px;" @click="saveToFile(item.text, 'yaml')">保存为文件</button>
                            </span>
                        </h3>
                        <pre>{{ item.text }}</pre>
                    </div>
                </div>
            </div>

            <!-- API文档选项卡 -->
            <div v-if="activeTab === 'apiDocs'" class="tab-content">
                <div v-if="taskParams.apiDocs.length > 0" class="result-container">
                    <div v-for="item in taskParams.apiDocs" :key="item.title" class="result-item">
                        <h3 style="display: flex; justify-content: space-between;">
                            {{ item.title }}
                            <button @click="openUrl(item.text)">查看说明文档</button>
                        </h3>
                        <a :href="item.text" target="_blank">{{ item.text }}</a>
                    </div>
                </div>
            </div>
        </template>

        <div v-else class="unsupported-page">
            <div class="unsupported-header">
                <span class="unsupported-text">请在百舸AIHC控制台页面使用</span>
                <a href="https://console.bce.baidu.com/aihc" target="_blank" class="console-link">
                    https://console.bce.baidu.com/aihc
                </a>
            </div>

            <div class="supported-pages-container">
                <h3 class="supported-title">支持的功能页面：</h3>
                <ul class="supported-pages">
                    <li v-for="(name, url) in urlList" :key="url" class="supported-item">
                        <span class="item-name">{{ name }}</span>
                        <span v-if="name == '任务列表'" class="item-hint">
                            <i class="hint-icon">ℹ️</i>
                            需要下拉选中一个资源池
                        </span>
                        <span v-if="name == '任务详情'" class="item-hint">
                            <i class="hint-icon">ℹ️</i>
                            生成创建任务CLI命令、保存参数为文件
                        </span>
                    </li>
                </ul>
            </div>
        </div>

        <div v-if="message" class="message" :class="message.type">
            <div class="message-content">
                <span class="message-text">{{ message.text }}</span>
                <button class="message-close" @click="dismissMessage()" title="关闭">
                    <span>×</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { formatRequestParams, generateYAML, generateCLICommand } from '../utils/common'
import UserGuide from '../components/UserGuide.vue'

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
        create: (createProperties: { url: string }) => void;
        query: (queryInfo: { active: boolean, currentWindow: boolean }, callback: (tabs: any[]) => void) => void;
        onUpdated: {
            addListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
        }
    }
}

// 状态
const activeTab = ref('cli')
const isConfigured = ref(false)
const isLoading = ref(false)
const message = ref<{ type: string, text: string } | null>(null)

const curPage = ref('支持的页面列表：')

const urlList = {
    'https://console.bce.baidu.com/aihc/resources': '资源池列表',
    'https://console.bce.baidu.com/aihc/resource/info?': '资源池详情',
    'https://console.bce.baidu.com/aihc/resource/queue?': '队列列表',
    'https://console.bce.baidu.com/aihc/tasks?': '任务列表',
    'https://console.bce.baidu.com/aihc/infoTaskIndex/detail?': '任务详情',
}

// 任务参数
const taskParams = reactive({
    type: 'ocr',
    dataSource: 'local',
    priority: 'medium',
    customParams: '',
    generated: '',
    name: '',
    commandScript: '',
    jsonItems: [] as { title: string, text: string }[],
    yamlItems: [] as { title: string, text: string }[],
    cliItems: [] as { title: string, text: string, doc?: string }[],
    apiDocs: [] as { title: string, text: string }[]
})

// 添加调试信息
const debugLog = (message: string, data?: any) => {
    console.log(`[AIHC Debug] ${message}`, data || '');
}

const openUrl = (url: string) => {
    chrome.tabs.create({ url })
}

const checkCurPage = () => {
    debugLog('开始检查当前页面')

    // 直接使用 chrome.tabs.query 获取当前标签页
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
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
                if (value == '任务列表' && currentUrl.includes('?clusters=all')) {
                    matched = false
                    break
                }
                matched = true
                await handleFetchUrl(value, currentUrl)
                break
            }
        }

        if (!matched) {
            debugLog('未找到匹配的URL模式')
            curPage.value = '支持的页面列表：'
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

// 解析Url，获取url和query参数
const parseUrl = (url: string) => {
    const urlObj = new URL(url)
    const queryParams = urlObj.searchParams
    const params: Record<string, string> = {}
    for (const [key, value] of queryParams.entries()) {
        params[key] = value
    }
    return {
        url: urlObj.origin + urlObj.pathname,
        params: params
    }
}

const handleFetchUrl = async (curPage: string, currentUrl: string) => {
    debugLog('当前页面', curPage)
    const { url, params } = parseUrl(currentUrl)
    debugLog('url', url)
    debugLog('params', params)

    isLoading.value = true
    taskParams.name = params.name
    
    if (curPage === '任务详情') {
        debugLog('任务详情')
        
        taskParams.apiDocs.push({
            title: '获取任务详情',
            text: 'https://cloud.baidu.com/doc/AIHC/s/rm56ipjsz'
        })

        taskParams.apiDocs.push({
            title: '创建任务',
            text: 'https://cloud.baidu.com/doc/AIHC/s/jm56inxn7'
        })

        taskParams.cliItems = [{
            title: '获取任务详情',
            text: `aihc job get ${params.jobId} -p ${params.clusterUuid}`,
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E4%BB%BB%E5%8A%A1%E8%AF%A6%E6%83%85'
        }]

        try {
            const url = `https://console.bce.baidu.com/api/cce/ai-service/v1/cluster/${params.clusterUuid}/aijob/${params.k8sName}?kind=${params.kind}&namespace=${params.k8sNamespace}&queueID=${params.queueID}&locale=zh-cn&_=${Date.now()}`
            debugLog('请求URL:', url)
            const response = await fetch(url)
            const data = await response.json();
            debugLog('API响应数据:', data);

            if (!data.result || !data.result.rawRequest) {
                showMessage('error', 'API响应中缺少必要的数据字段');
                return;
            }

            let taskInfo;
            let requestParams:any = {};
            try {
                taskInfo = JSON.parse(data.result.rawRequest);
                debugLog('解析后的任务信息:', taskInfo);
                requestParams = formatRequestParams(taskInfo)
                taskParams.commandScript = requestParams.jobSpec.command
                console.log('requestParams', requestParams)
            } catch (e) {
                const error = e as Error;
                debugLog('JSON解析错误:', error);
                debugLog('原始数据:', data.result.rawRequest);
                showMessage('error', '解析任务信息失败: ' + error.message);
                return;
            }

            const cliCommand = generateCLICommand(requestParams)

            taskParams.cliItems.push({
                title: '创建任务',
                text: cliCommand,
                doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E7%9B%B4%E6%8E%A5%E4%BC%A0%E5%8F%82%E6%96%B9%E5%BC%8F%E5%88%9B%E5%BB%BA%E4%BB%BB%E5%8A%A1'
            })

            taskParams.jsonItems.push({
                title: '创建任务Body参数',
                text: JSON.stringify(requestParams, null, 2)
            })

            taskParams.yamlItems.push({
                title: '创建任务Body参数',
                text: generateYAML(requestParams)
            })
        } catch (error) {
            showMessage('error', error as string);
        } finally {
            isLoading.value = false
        }
    }

    if (curPage === '资源池列表') {
        debugLog('资源池列表')
        taskParams.cliItems = [{
            title: '获取资源池列表',
            text: 'aihc pool list',
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E8%B5%84%E6%BA%90%E6%B1%A0%E5%88%97%E8%A1%A8'
        }]

        taskParams.apiDocs = [{
            title: '获取资源池列表',
            text: 'https://cloud.baidu.com/doc/AIHC/s/Km569l8xl'
        }]
        isLoading.value = false
    }

    if (curPage === '资源池详情') {
        debugLog('资源池详情')
        taskParams.cliItems = [{
            title: '获取资源池详情',
            text: `aihc pool get -p ${params.clusterUuid}`,
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E8%B5%84%E6%BA%90%E6%B1%A0%E8%AF%A6%E6%83%85'
        }]

        taskParams.apiDocs = [{
            title: '获取资源池详情',
            text: 'https://cloud.baidu.com/doc/AIHC/s/9m569kh7t'
        }]
        isLoading.value = false
    }

    if (curPage === '队列列表') {
        debugLog('队列列表')
        taskParams.cliItems = [{
            title: '获取队列列表',
            text: `aihc queue list -p ${params.clusterUuid}`,
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E9%98%9F%E5%88%97%E5%88%97%E8%A1%A8'
        }]

        taskParams.apiDocs = [{
            title: '获取队列列表',
            text: 'https://cloud.baidu.com/doc/AIHC/s/zm569o5xc'
        }]
        isLoading.value = false
    }

    if (curPage === '任务列表') {
        debugLog('任务列表')
        const { url, params } = parseUrl(currentUrl)
        debugLog('url', url)
        debugLog('params', params)
        taskParams.cliItems = [{
            title: '获取任务列表',
            text: `aihc job list -p ${params.clusters}`,
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E4%BB%BB%E5%8A%A1%E5%88%97%E8%A1%A8'
        }]

        taskParams.apiDocs = [{
            title: '获取任务列表',
            text: 'https://cloud.baidu.com/doc/AIHC/s/rm56ipjsz'
        }]
        isLoading.value = false
    }
}

// 在组件挂载时启动URL监听
onMounted(() => {
    debugLog('组件挂载')
    checkCurPage()
    observeUrlChanges()
})

const copyToClipboard = async (text: string, buttonElement?: HTMLElement) => {
    try {
        await navigator.clipboard.writeText(text)
        
        // 添加按钮视觉反馈
        if (buttonElement) {
            const originalText = buttonElement.textContent
            buttonElement.classList.add('copying')
            buttonElement.textContent = '已复制'
            
            setTimeout(() => {
                buttonElement.classList.remove('copying')
                buttonElement.textContent = originalText || '复制到剪贴板'
            }, 1500)
        }
        
        showMessage('success', '已复制到剪贴板', 2000)
    } catch (error) {
        console.error('复制失败:', error)
        showMessage('error', '复制失败，请手动复制', 3000)
    }
}

const saveToFile = (content: string, type: 'json' | 'yaml' | 'txt') => {
    const name = taskParams.name
    try {
        const fileName = `${name}.${type}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('保存文件失败:', error);
    }
};

const showMessage = (type: 'success' | 'error' | 'warning' | 'info', text: string, duration: number = 3000) => {
    message.value = { type, text }
    if (duration > 0) {
        setTimeout(() => {
            message.value = null
        }, duration)
    }
}

const dismissMessage = () => {
    message.value = null
}

// 计算属性：判断当前页面是否支持
const isSupportedPage = computed(() => {
    return curPage.value !== '支持的页面列表：' && curPage.value !== '无法获取页面信息' && curPage.value !== '无法获取当前标签页' && curPage.value !== '无法获取页面URL'
})
</script>

<style>
.popup-container {
    width: 100%;
    min-height: 100vh;
    padding: 20px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #333;
    background: #ffffff;
    box-sizing: border-box;
    overflow-x: hidden;
}

.header {
    margin-bottom: 16px;
}

.header h1 {
    margin: 0 0 16px 0;
    font-size: 20px;
    text-align: left;
    color: #333;
    font-weight: 600;
}

.tabs {
    display: flex;
    border-bottom: 2px solid #e9ecef;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
}

.tabs button {
    flex: 1;
    padding: 12px 16px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 14px;
    min-width: 90px;
    white-space: nowrap;
    color: #666;
    transition: all 0.2s ease;
    border-radius: 6px 6px 0 0;
}

.tabs button.active {
    color: #4285f4;
    border-bottom-color: #4285f4;
    font-weight: 500;
}

.tab-content {
    padding: 0px 0;
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
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    align-items: flex-start;
    position: relative;
    border-left: 4px solid;
    animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
}

.message-text {
    flex: 1;
    line-height: 1.4;
}

.message-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
    flex-shrink: 0;
}

.message-close:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.message-close span {
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
}

.message.success {
    background-color: #f0f9ff;
    color: #065f46;
    border-left-color: #10b981;
}

.message.error {
    background-color: #fef2f2;
    color: #991b1b;
    border-left-color: #ef4444;
}

.message.warning {
    background-color: #fffbeb;
    color: #92400e;
    border-left-color: #f59e0b;
}

.message.info {
    background-color: #eff6ff;
    color: #1e40af;
    border-left-color: #3b82f6;
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
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.result-container h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
}

.result-container pre {
    margin: 0 0 12px 0;
    white-space: pre-wrap;
    font-size: 12px;
    font-family: 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
    background: #ffffff;
    border: 1px solid #e9ecef;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    line-height: 1.6;
    color: #333;
    position: relative;
    max-height: 400px;
    overflow-y: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.result-container pre:hover {
    border-color: #dee2e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 代码语法高亮基本样式 */
.result-container pre .keyword {
    color: #0066cc;
    font-weight: bold;
}

.result-container pre .string {
    color: #009900;
}

.result-container pre .comment {
    color: #999999;
    font-style: italic;
}

.result-container button {
    padding: 8px 12px;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    min-width: 80px;
    white-space: nowrap;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.result-container button:hover {
    background: #3367d6;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(66, 133, 244, 0.3);
}

.result-container button:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(66, 133, 244, 0.3);
}

.result-container button:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* 按钮动画效果 */
.result-container button.copying {
    background: #28a745;
    pointer-events: none;
}

.result-container button.copying::after {
    content: '✓';
    margin-left: 4px;
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
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.unsupported-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}

.unsupported-text {
    font-size: 14px;
    color: #666;
}

.console-link {
    color: #4285f4;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s;
}

.console-link:hover {
    color: #3367d6;
    text-decoration: underline;
}

.supported-pages-container {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
}

.supported-title {
    font-size: 14px;
    color: #333;
    margin-bottom: 12px;
    font-weight: bold;
}

.supported-pages {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
}

.supported-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #333;
}

.item-name {
    font-weight: 500;
}

.item-hint {
    color: #4285f4;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
}

/* 加载指示器 */
.loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    color: #666;
    font-size: 14px;
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #4285f4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.hint-icon {
    font-size: 12px;
}
</style>