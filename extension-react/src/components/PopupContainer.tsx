import React, { useState, useEffect, useCallback } from 'react';
import { TaskParams, Message, PageInfo, TabType } from '../types';
import { getCurrentTabInfo } from '../utils/pageDetection';
import { copyToClipboard, saveToFile, openUrl, createMessage } from '../utils/helpers';
import { formatRequestParams, generateCLICommand, generateYAML } from '../utils/common';

// 导入组件
import Header from './Header';
import LoadingIndicator from './LoadingIndicator';
import TabNavigation from './TabNavigation';
import ContentArea from './ContentArea';
import MessageDisplay from './MessageDisplay';
import UnsupportedPage from './UnsupportedPage';
import UserGuide from './UserGuide';

interface PopupContainerProps {
  // 可以添加props
}

const PopupContainer: React.FC<PopupContainerProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('cli');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    isSupported: false,
    pageName: '支持的页面列表：',
    url: '',
    params: {}
  });
  
  const [taskParams, setTaskParams] = useState<TaskParams>({
    type: 'ocr',
    dataSource: 'local',
    priority: 'medium',
    customParams: '',
    generated: '',
    name: '',
    commandScript: '',
    jsonItems: [],
    yamlItems: [],
    cliItems: [],
    apiDocs: []
  });

  // 显示消息
  const showMessage = useCallback((type: Message['type'], text: string, duration: number = 3000) => {
    const newMessage = createMessage(type, text);
    setMessage(newMessage);
    
    if (duration > 0) {
      setTimeout(() => {
        setMessage(null);
      }, duration);
    }
  }, []);

  // 关闭消息
  const dismissMessage = useCallback(() => {
    setMessage(null);
  }, []);

  // 检查当前页面
  const checkCurrentPage = useCallback(async () => {
    try {
      const info = await getCurrentTabInfo();
      setPageInfo(info);
      
      if (info.isSupported) {
        await handleFetchUrl(info.pageName, info.url, info.params);
      }
    } catch (error) {
      console.error('检查页面失败:', error);
      showMessage('error', '获取页面信息失败');
    }
  }, [showMessage]);

  // 处理URL获取
  const handleFetchUrl = async (pageName: string, _url: string, params: Record<string, string>) => {
    setIsLoading(true);
    
    try {
      // 重置任务参数
      setTaskParams(prev => ({
        ...prev,
        name: params.name || '',
        jsonItems: [],
        yamlItems: [],
        cliItems: [],
        apiDocs: [],
        commandScript: ''
      }));

      if (pageName === '任务详情') {
        await handleTaskDetail(params);
      } else if (pageName === '资源池列表') {
        await handleResourcePoolList();
      } else if (pageName === '资源池详情') {
        await handleResourcePoolDetail(params);
      } else if (pageName === '队列列表') {
        await handleQueueList(params);
      } else if (pageName === '任务列表') {
        await handleTaskList(params);
      }
    } catch (error) {
      console.error('处理URL失败:', error);
      showMessage('error', '加载页面数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理任务详情页面
  const handleTaskDetail = async (params: Record<string, string>) => {
    console.log('[AIHC助手] 开始处理任务详情页面');
    
    setTaskParams(prev => ({
      ...prev,
      apiDocs: [
        {
          title: '获取任务详情',
          text: 'https://cloud.baidu.com/doc/AIHC/s/rm56ipjsz'
        },
        {
          title: '创建任务',
          text: 'https://cloud.baidu.com/doc/AIHC/s/jm56inxn7'
        }
      ],
      cliItems: [
        {
          title: '获取任务详情',
          text: `aihc job get ${params.jobId} -p ${params.clusterUuid}`,
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E4%BB%BB%E5%8A%A1%E8%AF%A6%E6%83%85'
        }
      ]
    }));

    try {
      // 构建API请求URL，与Vue版本完全一致
      const url = `https://console.bce.baidu.com/api/cce/ai-service/v1/cluster/${params.clusterUuid}/aijob/${params.k8sName}?kind=${params.kind}&namespace=${params.k8sNamespace}&queueID=${params.queueID}&locale=zh-cn&_=${Date.now()}`;
      console.log('[AIHC助手] 请求URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('[AIHC助手] API响应数据:', data);

      if (!data.result || !data.result.rawRequest) {
        showMessage('error', 'API响应中缺少必要的数据字段');
        return;
      }

      let taskInfo;
      let requestParams: any = {};
      try {
        taskInfo = JSON.parse(data.result.rawRequest);
        console.log('[AIHC助手] 解析后的任务信息:', taskInfo);
        requestParams = formatRequestParams(taskInfo);
        console.log('[AIHC助手] 格式化后的请求参数:', requestParams);
      } catch (e) {
        const error = e as Error;
        console.error('[AIHC助手] JSON解析错误:', error);
        showMessage('error', '解析任务信息失败: ' + error.message);
        return;
      }

      const cliCommand = generateCLICommand(requestParams);
      const jsonParams = JSON.stringify(requestParams, null, 2);
      const yamlParams = generateYAML(requestParams);

      setTaskParams(prev => ({
        ...prev,
        commandScript: requestParams.jobSpec?.command || '',
        cliItems: [
          ...prev.cliItems,
          {
            title: '创建任务',
            text: cliCommand,
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E7%9B%B4%E6%8E%A5%E4%BC%A0%E5%8F%82%E6%96%B9%E5%BC%8F%E5%88%9B%E5%BB%BA%E4%BB%BB%E5%8A%A1'
          }
        ],
        jsonItems: [
          {
            title: '创建任务Body参数',
            text: jsonParams
          }
        ],
        yamlItems: [
          {
            title: '创建任务Body参数',
            text: yamlParams
          }
        ]
      }));

      showMessage('success', '任务详情加载成功');
      
    } catch (error) {
      console.error('[AIHC助手] 获取任务详情失败:', error);
      showMessage('error', '获取任务详情失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 处理资源池列表页面
  const handleResourcePoolList = async () => {
    setTaskParams(prev => ({
      ...prev,
      cliItems: [
        {
          title: '获取资源池列表',
          text: 'aihc pool list',
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E8%B5%84%E6%BA%90%E6%B1%A0%E5%88%97%E8%A1%A8'
        }
      ],
      apiDocs: [
        {
          title: '获取资源池列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Km569l8xl'
        }
      ]
    }));
  };

  // 处理资源池详情页面
  const handleResourcePoolDetail = async (params: Record<string, string>) => {
    setTaskParams(prev => ({
      ...prev,
      cliItems: [
        {
          title: '获取资源池详情',
          text: `aihc pool get -p ${params.clusterUuid}`,
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E8%B5%84%E6%BA%90%E6%B1%A0%E8%AF%A6%E6%83%85'
        }
      ],
      apiDocs: [
        {
          title: '获取资源池详情',
          text: 'https://cloud.baidu.com/doc/AIHC/s/9m569kh7t'
        }
      ]
    }));
  };

  // 处理队列列表页面
  const handleQueueList = async (params: Record<string, string>) => {
    setTaskParams(prev => ({
      ...prev,
      cliItems: [
        {
          title: '获取队列列表',
          text: `aihc queue list -p ${params.clusterUuid}`,
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E9%98%9F%E5%88%97%E5%88%97%E8%A1%A8'
        }
      ],
      apiDocs: [
        {
          title: '获取队列列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/zm569o5xc'
        }
      ]
    }));
  };

  // 处理任务列表页面
  const handleTaskList = async (params: Record<string, string>) => {
    setTaskParams(prev => ({
      ...prev,
      cliItems: [
        {
          title: '获取任务列表',
          text: `aihc job list -p ${params.clusters}`,
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E4%BB%BB%E5%8A%A1%E5%88%97%E8%A1%A8'
        }
      ],
      apiDocs: [
        {
          title: '获取任务列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/rm56ipjsz'
        }
      ]
    }));
  };

  // 复制文本处理
  const handleCopyText = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      showMessage('success', '已复制到剪贴板', 2000);
    } else {
      showMessage('error', '复制失败，请手动复制', 3000);
    }
  };

  // 保存文件处理
  const handleSaveFile = (content: string, type: 'json' | 'yaml' | 'txt') => {
    try {
      const filename = taskParams.name || 'aihc-export';
      saveToFile(content, filename, type);
      showMessage('success', '文件已保存');
    } catch (error) {
      showMessage('error', '保存文件失败');
    }
  };

  // 打开URL处理
  const handleOpenUrl = (url: string) => {
    openUrl(url);
  };

  // 初始化
  useEffect(() => {
    checkCurrentPage();
    
    // 监听URL变化 - 与Vue版本保持一致
    const handleUrlChange = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo, _tab: chrome.tabs.Tab) => {
      if (changeInfo.url) {
        console.log('[AIHC助手] 检测到URL变化:', changeInfo.url);
        checkCurrentPage();
      }
    };
    
    // 监听Chrome tabs API，添加错误处理
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
      try {
        chrome.tabs.onUpdated.addListener(handleUrlChange);
        console.log('[AIHC助手] URL变化监听器已添加');
        
        return () => {
          try {
            if (chrome.tabs && chrome.tabs.onUpdated) {
              chrome.tabs.onUpdated.removeListener(handleUrlChange);
              console.log('[AIHC助手] URL变化监听器已移除');
            }
          } catch (error) {
            console.warn('[AIHC助手] 移除URL监听器失败:', error);
          }
        };
      } catch (error) {
        console.warn('[AIHC助手] 添加URL监听器失败:', error);
      }
    } else {
      console.log('[AIHC助手] Chrome tabs API不可用，跳过URL监听');
    }
  }, [checkCurrentPage]);

  return (
    <div className="popup-container">
      <UserGuide />
      <Header pageName={pageInfo.pageName} />
      
      {pageInfo.isSupported ? (
        <>
          {isLoading && <LoadingIndicator />}
          
          {!isLoading && (
            <>
              <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                taskParams={taskParams}
              />
              
              <ContentArea
                activeTab={activeTab}
                taskParams={taskParams}
                onCopyText={handleCopyText}
                onSaveFile={handleSaveFile}
                onOpenUrl={handleOpenUrl}
              />
            </>
          )}
        </>
      ) : (
        <UnsupportedPage currentUrl={pageInfo.url} />
      )}
      
      {message && (
        <MessageDisplay
          message={message}
          onDismiss={dismissMessage}
        />
      )}
    </div>
  );
};

export default PopupContainer;