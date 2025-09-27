import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TaskParams, Message, PageInfo, TabType } from '../types';
import { getCurrentTabInfo } from '../utils/pageDetection';
import { copyToClipboard, saveToFile, openUrl, createMessage } from '../utils/helpers';
import { PageHandlerManager } from '../handlers';

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

  // 生成请求示例的通用方法
  const generateRequestExample = (
    method: 'GET' | 'POST', 
    action: string, 
    params?: { resourcePoolId?: string; resourcePoolType?: string; serviceId?: string; datasetId?: string; modelId?: string; pageNumber?: string; pageSize?: string; versionId?: string }
  ) => {
    const baseUrl = 'aihc.bj.baidubce.com';
    let endpoint = `?action=${action}`;
    
    if (params?.resourcePoolId) {
      endpoint += `&resourcePoolId=${params.resourcePoolId}`;
    }
    if (params?.resourcePoolType) {
      endpoint += `&resourcePoolType=${params.resourcePoolType}`;
    }
    if (params?.serviceId) {
      endpoint += `&serviceId=${params.serviceId}`;
    }
    if (params?.datasetId) {
      endpoint += `&datasetId=${params.datasetId}`;
    }
    if (params?.modelId) {
      endpoint += `&modelId=${params.modelId}`;
    }
    if (params?.pageNumber) {
      endpoint += `&pageNumber=${params.pageNumber}`;
    }
    if (params?.pageSize) {
      endpoint += `&pageSize=${params.pageSize}`;
    }
    if (params?.versionId) {
      endpoint += `&versionId=${params.versionId}`;
    }
    
    const headers = [
      `Host: ${baseUrl}`,
      'Authorization: authorization string',
      'Content-Type: application/json',
      'version: v2'
    ];
    
    return `${method} ${endpoint}
${headers.join('\n')}`;
  };

  // 创建页面处理器管理器
  const pageHandlerManager = new PageHandlerManager({ generateRequestExample });

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

  // 处理URL获取
  const handleFetchUrl = async (pageName: string, _url: string, params: Record<string, string>) => {
    console.log('[AIHC助手] 开始处理页面:', pageName, params);
    
    // 防止重复加载
    if (isLoading) {
      console.log('[AIHC助手] 正在加载中，跳过重复请求');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('[AIHC助手] 设置加载状态为true');
      
      // 使用页面处理器管理器处理页面
      console.log('[AIHC助手] 调用页面处理器管理器');
      const pageData = await pageHandlerManager.handlePage(pageName, params);
      console.log('[AIHC助手] 页面处理器返回数据:', pageData);
      
      // 更新任务参数
      setTaskParams(prev => ({
        ...prev,
        ...pageData
      }));
      console.log('[AIHC助手] 任务参数已更新');
      
      // 检查当前activeTab是否仍然有效，如果无效则设置默认tab
      // 使用useCallback包装setActiveTab以避免异步状态问题
      const setDefaultTab = () => {
        if (pageData.apiDocs && pageData.apiDocs.length > 0) {
          setActiveTab('apiDocs');
        } else if (pageData.cliItems && pageData.cliItems.length > 0) {
          setActiveTab('cli');
        }
      };
      
      // 立即检查并设置默认tab，不使用setTimeout
      const currentTabValid = (
        (activeTab === 'cli' && pageData.cliItems && pageData.cliItems.length > 0) ||
        (activeTab === 'apiDocs' && pageData.apiDocs && pageData.apiDocs.length > 0) ||
        (activeTab === 'chat' && pageData.chatConfig) ||
        (activeTab === 'json' && pageData.jsonItems && pageData.jsonItems.length > 0) ||
        (activeTab === 'yaml' && pageData.yamlItems && pageData.yamlItems.length > 0) ||
        (activeTab === 'commandScript' && pageData.commandScript)
      );
      
      if (!currentTabValid) {
        setDefaultTab();
      }
      
    } catch (error) {
      console.error('处理URL失败:', error);
      showMessage('error', '加载页面数据失败');
    } finally {
      console.log('[AIHC助手] 设置加载状态为false');
      setIsLoading(false);
    }
  };

  // 复制文本处理
  const handleCopyText = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      showMessage('success', '已复制到剪贴板', 2000);
    } else {
      showMessage('error', '复制失败', 2000);
    }
  };

  // 保存文件处理
  const handleSaveFile = (content: string, type: 'json' | 'yaml' | 'txt') => {
    saveToFile(content, type);
    showMessage('success', '文件已保存', 2000);
  };

  // 打开URL处理
  const handleOpenUrl = (url: string) => {
    openUrl(url);
  };

  // 加载Chat配置
  const handleLoadChatConfig = useCallback(async (serviceId: string) => {
    console.log('[PopupContainer] handleLoadChatConfig 被调用，serviceId:', serviceId);
    try {
      setIsLoading(true);
      setTaskParams(prev => ({ ...prev, chatLoading: true, chatError: undefined }));
      
      console.log('[AIHC助手] 开始加载Chat配置，serviceId:', serviceId);
      
      // 调用API获取服务详情
      const apiUrl = `https://console.bce.baidu.com/api/aihcpom/app/v1/details?appId=${serviceId}&locale=zh-cn&_=${Date.now()}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AIHC助手] 服务详情数据完整响应:', JSON.stringify(data, null, 2));
        
        // 尝试不同的数据结构路径
        let status = null;
        let serviceInfo = null;
        
        // 检查可能的路径
        if (data.data?.status) {
          status = data.data.status;
          console.log('[AIHC助手] 从 data.data.status 获取状态信息');
        } else if (data.status) {
          status = data.status;
          console.log('[AIHC助手] 从 data.status 获取状态信息');
        } else if (data.data) {
          serviceInfo = data.data;
          console.log('[AIHC助手] 从 data 获取服务信息');
        } else {
          console.log('[AIHC助手] 数据结构:', Object.keys(data));
          throw new Error('无法找到服务状态信息，请检查API响应格式');
        }
        
        // 从状态信息中提取配置
        let internalIP, port, token, basePath;
        
        if (status) {
          internalIP = status.accessIPs?.internal;
          port = status.accessPorts?.[0]?.servicePort || 8000;
          token = status.aiGateway?.tokens?.serveless;
          basePath = status.aiGateway?.basePath || '';
        } else if (serviceInfo) {
          // 尝试从服务信息中提取
          internalIP = serviceInfo.accessIPs?.internal;
          port = serviceInfo.accessPorts?.[0]?.servicePort || 8000;
          token = serviceInfo.aiGateway?.tokens?.serveless;
          basePath = serviceInfo.aiGateway?.basePath || '';
        }
        
        console.log('[AIHC助手] 提取的服务信息:', {
          internalIP,
          port,
          token: token ? `${token.substring(0, 20)}...` : 'none',
          basePath,
          hasStatus: !!status,
          hasServiceInfo: !!serviceInfo
        });
        
        if (internalIP && token) {
          const chatConfig = {
            serviceUrl: `http://${internalIP}${basePath}${port}`,
            accessToken: token,
            basePath: '',
            serviceId: serviceId,
            isLoaded: true
          };
          
          console.log('[AIHC助手] Chat配置创建成功:', {
            serviceUrl: chatConfig.serviceUrl,
            basePath: chatConfig.basePath,
            hasToken: !!chatConfig.accessToken
          });
          
          setTaskParams(prev => ({
            ...prev,
            chatConfig,
            chatLoading: false,
            chatError: undefined
          }));
          
          showMessage('success', 'Chat配置加载成功！');
        } else {
          throw new Error(`服务状态信息不完整，缺少必要的访问信息。IP: ${internalIP}, Token: ${token ? '有' : '无'}`);
        }
      } else {
        throw new Error(`API请求失败，状态码: ${response.status}`);
      }
    } catch (error) {
      console.error('[AIHC助手] Chat配置加载失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      setTaskParams(prev => ({
        ...prev,
        chatLoading: false,
        chatError: errorMessage
      }));
      
      showMessage('error', `Chat配置加载失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [showMessage]);


  // 防抖计时器
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 页面检测和更新函数
  const detectAndUpdatePage = useCallback(async () => {
    // 清除之前的防抖计时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 设置新的防抖计时器
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const currentTabInfo = await getCurrentTabInfo();
        console.log('[AIHC助手] 检测到页面变化:', currentTabInfo);
        
        setPageInfo(currentTabInfo);
        
        if (currentTabInfo.isSupported) {
          await handleFetchUrl(currentTabInfo.pageName, currentTabInfo.url, currentTabInfo.params);
        } else {
          // 清空不支持页面的数据
          setTaskParams(prev => ({
            ...prev,
            cliItems: [],
            apiDocs: [],
            jsonItems: [],
            yamlItems: [],
            commandScript: '',
            chatConfig: undefined
          }));
          setActiveTab('cli');
        }
      } catch (error) {
        console.error('页面检测失败:', error);
        showMessage('error', '页面检测失败');
      }
    }, 200); // 200ms防抖延迟
  }, []); // 移除依赖，避免无限循环

  // 初始化页面检测
  useEffect(() => {
    detectAndUpdatePage();
  }, [detectAndUpdatePage]);

  // 监听页面变化
  useEffect(() => {
    const handleTabUpdate = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      // 只处理当前活动标签页的变化，并且确保是AIHC控制台页面
      if (changeInfo.url && tab.active && tab.url && tab.url.includes('console.bce.baidu.com/aihc')) {
        console.log('[AIHC助手] 检测到AIHC页面URL变化:', changeInfo.url);
        // 使用防抖的detectAndUpdatePage，避免频繁触发
        detectAndUpdatePage();
      }
    };

    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      console.log('[AIHC助手] 检测到标签页切换:', activeInfo.tabId);
      // 获取当前标签页信息，只处理AIHC页面
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && tab.url.includes('console.bce.baidu.com/aihc')) {
          detectAndUpdatePage();
        }
      });
    };

    // 监听标签页更新
    if (chrome.tabs && chrome.tabs.onUpdated) {
      chrome.tabs.onUpdated.addListener(handleTabUpdate);
    }

    // 监听标签页激活
    if (chrome.tabs && chrome.tabs.onActivated) {
      chrome.tabs.onActivated.addListener(handleTabActivated);
    }

    // 清理监听器
    return () => {
      if (chrome.tabs && chrome.tabs.onUpdated) {
        chrome.tabs.onUpdated.removeListener(handleTabUpdate);
      }
      if (chrome.tabs && chrome.tabs.onActivated) {
        chrome.tabs.onActivated.removeListener(handleTabActivated);
      }
    };
  }, [detectAndUpdatePage]);

  // 渲染内容
  const renderContent = () => {
    if (!pageInfo.isSupported) {
      return (
        <UnsupportedPage 
          currentUrl={pageInfo.url}
        />
      );
    }

    if (isLoading) {
      return <LoadingIndicator />;
    }

    return (
      <>
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          taskParams={taskParams}
          pageName={pageInfo.pageName}
        />
        <ContentArea
          activeTab={activeTab}
          taskParams={taskParams}
          onCopyText={handleCopyText}
          onSaveFile={handleSaveFile}
          onOpenUrl={handleOpenUrl}
          onLoadChatConfig={handleLoadChatConfig}
        />
      </>
    );
  };

  return (
    <div className="popup-container">
      <Header 
        pageName={pageInfo.pageName}
      />
      
      {renderContent()}
      
      {message && (
        <MessageDisplay 
          message={message} 
          onDismiss={() => setMessage(null)}
        />
      )}
      
      <UserGuide />
    </div>
  );
};

export default PopupContainer;