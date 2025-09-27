import React, { useState, useEffect, useCallback } from 'react';
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
    
    try {
      setIsLoading(true);
      
      // 使用页面处理器管理器处理页面
      const pageData = await pageHandlerManager.handlePage(pageName, params);
      
      // 更新任务参数
      setTaskParams(prev => ({
        ...prev,
        ...pageData
      }));
      
      // 检查是否有CLI命令，如果没有则默认显示API tab，如果有chatConfig则优先显示Chat tab
      setTimeout(() => {
        setTaskParams(currentParams => {
          if (currentParams.chatConfig) {
            setActiveTab('chat');
          } else if (currentParams.cliItems.length === 0 && currentParams.apiDocs.length > 0) {
            setActiveTab('apiDocs');
          }
          return currentParams;
        });
      }, 0);
      
    } catch (error) {
      console.error('处理URL失败:', error);
      showMessage('error', '加载页面数据失败');
    } finally {
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


  // 页面检测和更新函数
  const detectAndUpdatePage = useCallback(async () => {
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
  }, [handleFetchUrl, showMessage]);

  // 初始化页面检测
  useEffect(() => {
    detectAndUpdatePage();
  }, [detectAndUpdatePage]);

  // 监听页面变化
  useEffect(() => {
    const handleTabUpdate = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      // 只处理当前活动标签页的变化
      if (changeInfo.url && tab.active && tab.url) {
        console.log('[AIHC助手] 检测到URL变化:', changeInfo.url);
        // 延迟一下再检测，确保页面完全加载
        setTimeout(() => {
          detectAndUpdatePage();
        }, 500);
      }
    };

    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      console.log('[AIHC助手] 检测到标签页切换:', activeInfo.tabId);
      // 延迟一下再检测，确保页面完全加载
      setTimeout(() => {
        detectAndUpdatePage();
      }, 300);
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
        />
        <ContentArea
          activeTab={activeTab}
          taskParams={taskParams}
          onCopyText={handleCopyText}
          onSaveFile={handleSaveFile}
          onOpenUrl={handleOpenUrl}
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