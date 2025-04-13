// ==UserScript==
// @name         Baidu AIHC CLI生成按钮
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  在AIHC任务详情页添加生成CLI命令按钮
// @author       You
// @match        https://console.bce.baidu.com/aihc/infoTaskIndex/detail?*
// @match        https://console.bce.baidu.com/aihc/infoTaskIndex/detail*
// @match        https://console.bce.baidu.com/aihc/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

console.log('AIHC CLI Button 脚本开始执行 - 直接控制台输出');
// alert('AIHC CLI Button 脚本已加载');

// bce aihc submit --name czhtets --cluster cce-066ievmp --namespace default --image pytorch:latest

(function() {
    'use strict';

    // 全局标志，追踪按钮是否已添加
    let buttonsAdded = false;
    // 记录上次处理的URL，避免重复处理
    let lastProcessedUrl = '';
    
    // 调试日志函数
    function logDebug(message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[AIHC CLI Button] ${timestamp} - ${message}`;
        console.log(logMessage);
        if (data) {
            console.log('调试数据:', data);
        }
    }

    // 检查脚本是否已加载
    console.log('脚本开始执行 - 初始检查');
    logDebug('脚本开始执行');
    console.log('当前URL:', window.location.href);
    console.log('页面标题:', document.title);
    console.log('脚本版本: 0.3');

    // 等待页面加载完成
    function waitForElement(selector, timeout = 3000) {
        console.log('等待元素:', selector);
        return new Promise((resolve, reject) => {
            logDebug(`开始等待元素: ${selector}`);
            
            // 立即检查一次
            const element = document.querySelector(selector);
            if (element) {
                logDebug(`元素已存在: ${selector}`);
                return resolve(element);
            }

            // 使用MutationObserver监听DOM变化
            const observer = new MutationObserver(mutations => {
                const element = document.querySelector(selector);
                if (element) {
                    logDebug(`元素已加载: ${selector}`);
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // 设置超时
            setTimeout(() => {
                observer.disconnect();
                logDebug(`等待元素超时: ${selector}`);
                reject(new Error(`等待元素 ${selector} 超时`));
            }, timeout);
        });
    }

    // 获取GPU类型的简称
    function getGpuTypeShortName(gpuType) {
        const gpuMapping = {
            'nvidia-v100': 'v100',
            'nvidia-a100': 'a100',
            'nvidia-a800': 'a800',
            'nvidia-a10': 'a10',
            'nvidia-a30': 'a30',
            'nvidia-a40': 'a40',
            'nvidia-h800': 'h800',
            'nvidia-h100': 'h100',
            'nvidia-l4': 'l4',
            'kunlunxin-p800': 'klx-p800',
            'kunlunxin-p100': 'klx-p100',
            'kunlunxin-p920': 'klx-p920',
            'iluvatar-bi': 'bi',
            'iluvatar-pigeon': 'pigeon'
        };
        
        const lowerType = gpuType.toLowerCase();
        
        for (const [key, shortName] of Object.entries(gpuMapping)) {
            if (lowerType.includes(key)) {
                return shortName;
            }
        }
        
        // 如果找不到匹配项，返回原始类型
        return lowerType;
    }

    // 检查任务名称是否含有RDMA标识
    function isRdmaEnabled(name, config) {
        // 首先检查基本配置中是否明确指定了RDMA状态
        if (config && config['RDMA'] === '已开启') {
            return true;
        }
        
        // 其次检查任务名称
        return name && name.toLowerCase().includes('rdma');
    }

    // 将容错参数格式化
    function formatFaultToleranceArgs(config) {
        // 基本容错参数
        const defaultArgs = [
            "--enable-replace=true",
            "--enable-hang-detection=true",
            "--hang-detection-log-timeout-minutes=7",
            "--hang-detection-startup-toleration-minutes=15",
            "--hang-detection-stack-timeout-minutes=3",
            "--max-num-of-unconditional-retry=2",
            "--unconditional-retry-observe-seconds=3600",
            "--enable-use-nodes-of-last-job=true",
            "--enable-checkpoint-migration=true"
        ];

        // 根据配置添加其他参数
        if (config && config['RDMA高精度监控'] === '已开启') {
            defaultArgs.push("--enable-rdma-monitoring=true");
        }

        return defaultArgs.join(" ");
    }

    // 创建CLI按钮
    function createBceCliButton() {
        logDebug('开始创建CLI按钮');
        const button = document.createElement('button');
        button.className = 'ant-btn css-sk7pns ant-btn-default ant-btn-color-default ant-btn-variant-outlined osui-button';
        button.style.minWidth = '95px';
        button.innerHTML = '<span>生成CLI命令</span>';
        
        button.addEventListener('click', async function() {
            logDebug('CLI按钮被点击');
            
            // 获取URL参数
            const urlParams = new URLSearchParams(window.location.search);
            const k8sName = urlParams.get('k8sName');
            const clusterUuid = urlParams.get('clusterUuid');
            const k8sNamespace = urlParams.get('k8sNamespace');
            const queueID = urlParams.get('queueID');
            const kind = urlParams.get('kind');

            let taskInfo = {};
            
            // 发送GET请求,从接口中获取任务信息
            try {
                const response = await fetch(`https://console.bce.baidu.com/api/cce/ai-service/v1/cluster/${clusterUuid}/aijob/${k8sName}?kind=${kind}&namespace=${k8sNamespace}&queueID=${queueID}&locale=zh-cn&_=${Date.now()}`);
                const data = await response.json();
                logDebug('获取到的任务信息', data);
                console.log('任务信息:', data.result.rawRequest);
                taskInfo = JSON.parse(data.result.rawRequest);
            } catch (error) {
                logDebug('获取任务信息失败', error);
                console.error('获取任务信息失败:', error);
            }
            
            // 生成CLI命令
            let cliCommand = `aihc job create --name "${taskInfo.name}" --framework ${(taskInfo.jobFramework || taskInfo.workloadType).toLowerCase()} --image "${taskInfo.jobSpec.Master.image}:${taskInfo.jobSpec.Master.tag}"`;
            
            // 添加队列参数（如果有）
            if (taskInfo.queue && taskInfo.queue !== 'default') {
                cliCommand += ` --queue "${taskInfo.queue}"`;
            }
            
            // 添加RDMA参数
            cliCommand += ` --enable-rdma=${taskInfo.enableRdma || false}`;
            
            // 添加GPU资源（如果有）
            if (taskInfo.jobSpec.Master.resource && taskInfo.jobSpec.Master.resource.gpu) {
                const gpuType = getGpuTypeShortName(taskInfo.jobSpec.Master.resource.gpu.type);
                cliCommand += ` --gpu ${gpuType}=${taskInfo.jobSpec.Master.resource.gpu.count}`;
            }
            
            // 添加CPU和内存资源（如果有）
            if (taskInfo.jobSpec.Master.resource) {
                if (taskInfo.jobSpec.Master.resource.cpu) {
                    cliCommand += ` --cpu ${taskInfo.jobSpec.Master.resource.cpu}`;
                }
                if (taskInfo.jobSpec.Master.resource.memory) {
                    cliCommand += ` --memory ${taskInfo.jobSpec.Master.resource.memory}`;
                }
                if (taskInfo.jobSpec.Master.resource.shmSize) {
                    cliCommand += ` --shm-size ${taskInfo.jobSpec.Master.resource.shmSize}`;
                }
            }
            
            // 添加BCCL参数
            cliCommand += ` --enable-bccl=${taskInfo.enableBccl || false}`;
            
            // 添加容错参数
            if (taskInfo.faultTolerance) {
                cliCommand += ` --enable-fault-tolerance=true`;
                
                // 添加容错详细参数
                const ftArgs = [
                    `--enable-replace=${taskInfo.enableReplace || false}`,
                    `--enable-hang-detection=${taskInfo.enabledHangDetection || false}`,
                    `--hang-detection-log-timeout-minutes=${taskInfo.hangDetectionTimeoutMinutes || 0}`,
                    `--hang-detection-startup-toleration-minutes=${taskInfo.hangDetectionStartupTolerationMinutes || 0}`,
                    `--hang-detection-stack-timeout-minutes=${taskInfo.hangDetectionStackTimeoutMinutes || 0}`,
                    `--max-num-of-unconditional-retry=${taskInfo.unconditionalFaultToleranceLimit || 0}`,
                    `--unconditional-retry-observe-seconds=${taskInfo.unconditionalFaultToleranceObserveSeconds || 0}`,
                    `--enable-use-nodes-of-last-job=${taskInfo.enableUseNodesOfLastJob || false}`,
                    `--enable-checkpoint-migration=${taskInfo.enableCheckpointMigration || false}`
                ];
                
                if (taskInfo.internalFaultToleranceAlarmPhone) {
                    ftArgs.push(`--internal-fault-tolerance-alarm-phone=${taskInfo.internalFaultToleranceAlarmPhone}`);
                }
                
                if (taskInfo.customFaultTolerancePattern && Array.isArray(taskInfo.customFaultTolerancePattern)) {
                    taskInfo.customFaultTolerancePattern.forEach(pattern => {
                        if (pattern) {
                            ftArgs.push(`--custom-log-patterns=${pattern}`);
                        }
                    });
                }
                
                cliCommand += ` --fault-tolerance-args="${ftArgs.join(' ')}"`;
            } else {
                cliCommand += ` --enable-fault-tolerance=false`;
            }
            
            // 添加主机网络参数
            if (taskInfo.hostNetwork) {
                cliCommand += ` --host-network`;
            }
            
            // 添加特权模式参数
            if (taskInfo.privileged) {
                cliCommand += ` --privileged=true`;
            }
            
            // 添加优先级
            cliCommand += ` --priority ${taskInfo.priority || 'normal'}`;
            
            // 添加副本数
            cliCommand += ` --replicas ${taskInfo.jobSpec.Master.replicas || 1}`;
            
            // 添加环境变量
            if (taskInfo.jobSpec.Master.env && typeof taskInfo.jobSpec.Master.env === 'object') {
                Object.entries(taskInfo.jobSpec.Master.env).forEach(([key, value]) => {
                    if (key && value !== undefined && value !== null) {
                        cliCommand += ` --env "${key}=${value}"`;
                    }
                });
            }
            
            // 添加数据源
            if (taskInfo.datasource && Array.isArray(taskInfo.datasource)) {
                taskInfo.datasource.forEach(ds => {
                    if (ds && ds.mountPath) {
                        // 处理数据源类型
                        let dsType = ds.type;
                        if (dsType === 'pfsl1') {
                            dsType = 'pfs';
                        } else if (dsType === 'emptydir') {
                            dsType = 'empty';
                        }
                        
                        cliCommand += ` --ds-type ${dsType}`;
                        cliCommand += ` --ds-mountpath "${ds.mountPath}"`;
                        
                        if (ds.name) {
                            cliCommand += ` --ds-name "${ds.name}"`;
                        }
                        
                        if (ds.options) {
                            if (ds.options.readOnly) {
                                cliCommand += ` --ds-readonly`;
                            }
                            if (ds.options.sizeLimit) {
                                cliCommand += ` --ds-size-limit ${ds.options.sizeLimit}`;
                            }
                            if (ds.type === 'pfsl1' && ds.options.pfsL1ClusterIp && ds.options.pfsL1ClusterPort) {
                                cliCommand += ` --ds-pfs-cluster-ip ${ds.options.pfsL1ClusterIp}`;
                                cliCommand += ` --ds-pfs-cluster-port ${ds.options.pfsL1ClusterPort}`;
                            }
                        }
                    }
                });
            }
            
            // 添加代码路径参数
            if (taskInfo.codeSource && taskInfo.codeSource.filePath) {
                cliCommand += ` --local-code "${taskInfo.codeSource.filePath}"`;
                if (taskInfo.codeSource.mountPath) {
                    cliCommand += ` --code-dir "${taskInfo.codeSource.mountPath}"`;
                } else {
                    cliCommand += ` --code-dir "/workspace"`;
                }
            }
            
            // 添加执行命令
            let command = '';
            if (taskInfo.command) {
                command = taskInfo.command;
            } else if (taskInfo.jobSpec.Master.command) {
                command = taskInfo.jobSpec.Master.command;
            }
            
            if (command) {
                if (taskInfo.jobSpec.Master.args) {
                    command += ' ' + taskInfo.jobSpec.Master.args;
                }
                cliCommand += ` --command "${command}"`;
            }
            
            // 添加标签
            if (taskInfo.labels && typeof taskInfo.labels === 'object') {
                Object.entries(taskInfo.labels).forEach(([key, value]) => {
                    if (key && value !== undefined && value !== null) {
                        cliCommand += ` --label "${key}=${value}"`;
                    }
                });
            }
            
            // 添加Tensorboard配置
            if (taskInfo.tensorboard && taskInfo.tensorboard.enable) {
                cliCommand += ` --enable-tensorboard=true`;
                if (taskInfo.tensorboard.logPath) {
                    cliCommand += ` --tensorboard-log-path "${taskInfo.tensorboard.logPath}"`;
                }
            }
            
            // 添加日志收集配置
            if (taskInfo.logCollectionFilePatterns && Array.isArray(taskInfo.logCollectionFilePatterns)) {
                taskInfo.logCollectionFilePatterns.forEach(pattern => {
                    if (pattern) {
                        cliCommand += ` --log-collection-pattern "${pattern}"`;
                    }
                });
            }
            
            logDebug('生成的CLI命令', cliCommand);
            
            // 直接复制命令到剪贴板
            navigator.clipboard.writeText(cliCommand).then(() => {
                logDebug('CLI命令已复制到剪贴板');
                
                // 使用简单的原生alert弹窗，确保能正常显示
                alert(`CLI命令已复制到剪贴板！\n\n${cliCommand}`);
            }).catch(err => {
                logDebug('复制到剪贴板失败', err);
                
                // 如果复制失败，也显示命令以便用户手动复制
                alert(`复制失败，请手动复制以下命令：\n\n${cliCommand}`);
            });
        });

        return button;
    }

    // 添加按钮到页面
    async function addCliButtons() {
        // 检查是否已添加按钮，避免重复添加
        if (buttonsAdded) {
            logDebug('按钮已添加，跳过重复添加');
            return;
        }
        
        // 检查当前URL是否为任务详情页
        if (!location.href.includes('/aihc/infoTaskIndex/detail')) {
            logDebug('当前页面不是任务详情页，不添加按钮');
            return;
        }
        
        // 检查是否与上次处理的URL相同
        if (lastProcessedUrl === location.href) {
            logDebug('当前URL已处理过，跳过重复处理');
            return;
        }
        
        lastProcessedUrl = location.href;
        logDebug('开始添加CLI按钮，URL: ' + location.href);
        
        try {
            // 等待页面完全加载
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve, { once: true });
                }
            });
            logDebug('页面加载完成');

            // 等待React组件加载完成
            await new Promise(resolve => setTimeout(resolve, 3000));
            logDebug('等待React组件加载完成');

            // 检查是否已经添加过按钮
            if (document.querySelector('[data-aihc-cli-button="true"]')) {
                logDebug('发现已存在的CLI按钮，跳过添加');
                buttonsAdded = true;
                return;
            }

            // 尝试多个可能的选择器
            const selectors = [
                '.ant-space.css-sk7pns.ant-space-horizontal',
                '.ant-space.ant-space-horizontal',
                '.ant-space',
                '.icloud-ui-page-layout-header-primary-extra'
            ];

            let buttonContainer = null;
            for (const selector of selectors) {
                try {
                    buttonContainer = await waitForElement(selector);
                    if (buttonContainer) {
                        logDebug(`找到按钮容器: ${selector}`);
                        break;
                    }
                } catch (error) {
                    logDebug(`选择器 ${selector} 未找到元素`);
                }
            }

            if (!buttonContainer) {
                logDebug('未找到合适的按钮容器');
                return;
            }

            logDebug('按钮容器已加载', {
                containerHTML: buttonContainer.outerHTML
            });
            
            // 检查是否已存在CLI按钮
            const existingBceButton = Array.from(buttonContainer.querySelectorAll('button')).find(
                btn => btn.textContent.includes('生成CLI命令')
            );
            
            // 创建按钮容器 - 只添加CLI命令按钮
            if (!existingBceButton) {
                const bceButtonWrapper = document.createElement('div');
                bceButtonWrapper.className = 'ant-space-item';
                const bceButton = createBceCliButton();
                // 添加标记，便于检查是否已存在
                bceButton.setAttribute('data-aihc-cli-button', 'true');
                bceButtonWrapper.appendChild(bceButton);
                
                // 插入到按钮组最左侧
                logDebug('准备插入CLI按钮');
                buttonContainer.insertBefore(bceButtonWrapper, buttonContainer.firstChild);
                logDebug('CLI按钮插入成功');
            } else {
                logDebug('CLI按钮已存在，跳过添加');
            }
            
            // 标记按钮已添加
            buttonsAdded = true;
        } catch (error) {
            logDebug('添加CLI按钮失败', error);
        }
    }

    // 优化事件监听，避免重复添加
    // 使用 MutationObserver 监听DOM变化和URL变化，统一处理按钮添加
    function setupEventListeners() {
        logDebug('设置事件监听器');
        
        // 处理DOM加载完成后的操作
        function handlePageReady() {
            if (location.href.includes('/aihc/infoTaskIndex/detail')) {
                logDebug('页面加载完成，延迟添加按钮');
                setTimeout(() => {
                    // 重置按钮状态，以便在新页面添加
                    buttonsAdded = false;
                    addCliButtons();
                }, 3000);
            }
        }
        
        // 仅添加一次DOMContentLoaded事件监听
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handlePageReady, { once: true });
        } else {
            handlePageReady();
        }
        
        // 监听URL变化
        let lastUrl = location.href;
        const urlObserver = new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                logDebug('URL发生变化', { oldUrl: lastUrl, newUrl: url });
                lastUrl = url;
                
                if (url.includes('/aihc/infoTaskIndex/detail')) {
                    logDebug('检测到任务详情页，重置按钮状态');
                    // 重置按钮状态，以便在新页面添加
                    buttonsAdded = false;
                    setTimeout(addCliButtons, 3000);
                }
            }
        });
        
        urlObserver.observe(document, { subtree: true, childList: true });
        
        // 监听React路由变化
        const originalPushState = history.pushState;
        history.pushState = function() {
            originalPushState.apply(history, arguments);
            logDebug('React路由变化');
            
            if (location.href.includes('/aihc/infoTaskIndex/detail')) {
                logDebug('检测到任务详情页路由变化，重置按钮状态');
                // 重置按钮状态，以便在新页面添加
                buttonsAdded = false;
                setTimeout(addCliButtons, 3000);
            }
        };
    }

    // 初始化脚本
    function initialize() {
        logDebug('初始化脚本');
        setupEventListeners();
        
        // 如果当前页面是任务详情页，初始添加按钮
        if (location.href.includes('/aihc/infoTaskIndex/detail')) {
            logDebug('初始加载任务详情页，准备添加按钮');
            setTimeout(addCliButtons, 3000);
        }
    }

    // 启动脚本
    initialize();

    // 添加错误处理
    window.addEventListener('error', function(event) {
        logDebug('脚本执行错误', event.error);
    });

    // 添加未捕获的Promise错误处理
    window.addEventListener('unhandledrejection', function(event) {
        logDebug('未处理的Promise错误', event.reason);
    });

    // 添加脚本加载完成日志
    console.log('脚本加载完成');
    logDebug('脚本加载完成');
})();