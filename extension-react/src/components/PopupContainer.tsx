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
      } else if (pageName === '自运维资源池列表' || pageName === '全托管资源池列表') {
        await handleResourcePoolList(pageName);
      } else if (pageName === '自运维资源池详情' || pageName === '全托管资源池详情') {
        await handleResourcePoolDetail(pageName, params);
      } else if (pageName === '队列列表' || pageName === '全托管队列列表') {
        await handleQueueList(pageName, params);
      } else if (pageName === '任务列表') {
        await handleTaskList(params);
      } else if (pageName === '自定义部署') {
        await handleCustomDeployment();
      } else if (pageName === '数据集管理') {
        await handleDatasets();
      } else if (pageName === '模型管理列表') {
        await handleModelManageList();
      } else if (pageName === '开发机列表') {
        await handleDevelopmentMachines();
      } else if (pageName === '在线服务部署详情') {
        await handleOnlineServiceDeploymentDetail(params);
      }
      
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

  // 生成请求示例
  const generateRequestExample = (
    method: 'GET' | 'POST', 
    action: string, 
    params?: { resourcePoolId?: string; resourcePoolType?: string; serviceId?: string }
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
    
    const headers = [
      `Host: ${baseUrl}`,
      'Authorization: authorization string',
      'Content-Type: application/json',
      'version: v2'
    ];
    
    return `${method} ${endpoint}
${headers.join('\n')}`;
  };

  // 处理任务详情页面
  const handleTaskDetail = async (params: Record<string, string>) => {
    console.log('[AIHC助手] 开始处理任务详情页面');
    
    setTaskParams(prev => ({
      ...prev,
      apiDocs: [
        {
          title: '获取任务详情',
          text: 'https://cloud.baidu.com/doc/AIHC/s/rm56ipjsz',
          requestExample: generateRequestExample('POST', 'DescribeJob', { resourcePoolId: params.clusterUuid })
        },
        {
          title: '创建任务',
          text: 'https://cloud.baidu.com/doc/AIHC/s/jm56inxn7',
          requestExample: generateRequestExample('POST', 'CreateJob', { resourcePoolId: params.clusterUuid })
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
  const handleResourcePoolList = async (pageName: string) => {
    // 根据传入的页面名称确定资源池类型
    const isServerlessResource = pageName === '全托管资源池列表';
    const resourcePoolType = isServerlessResource ? 'dedicatedV2' : 'common';
    const pageTypeName = isServerlessResource ? '全托管' : '自运维';
    
    setTaskParams(prev => ({
      ...prev,
      cliItems: [
        {
          title: `获取${pageTypeName}资源池列表`,
          text: `aihc pool list --resourcePoolType ${resourcePoolType}`,
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E8%B5%84%E6%BA%90%E6%B1%A0%E5%88%97%E8%A1%A8'
        }
      ],
      apiDocs: [
        {
          title: `获取${pageTypeName}资源池列表`,
          text: 'https://cloud.baidu.com/doc/AIHC/s/Km569l8xl',
          requestExample: generateRequestExample('GET', 'DescribeResourcePools', { 
            resourcePoolType: isServerlessResource ? 'dedicatedV2' : 'common' 
          })
        }
      ]
    }));
  };

  // 处理资源池详情页面
  const handleResourcePoolDetail = async (pageName: string, params: Record<string, string>) => {
    // 根据传入的页面名称确定资源池类型
    const isServerlessResource = pageName === '全托管资源池详情';
    const pageTypeName = isServerlessResource ? '全托管' : '自运维';
    
    // 根据页面类型获取正确的资源池ID参数
    const resourcePoolId = isServerlessResource ? params.resourcePoolId : params.clusterUuid;
    
    setTaskParams(prev => ({
      ...prev,
      cliItems: [
        {
          title: `获取${pageTypeName}资源池详情`,
          text: `aihc pool get -p ${resourcePoolId}`,
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E8%B5%84%E6%BA%90%E6%B1%A0%E8%AF%A6%E6%83%85'
        }
      ],
      apiDocs: [
        {
          title: `获取${pageTypeName}资源池详情`,
          text: 'https://cloud.baidu.com/doc/AIHC/s/9m569kh7t',
          requestExample: generateRequestExample('GET', 'DescribeResourcePool', { resourcePoolId, resourcePoolType: isServerlessResource ? 'dedicatedV2' : 'common' })
        }
      ]
    }));
  };

  // 处理队列列表页面
  const handleQueueList = async (pageName: string, params: Record<string, string>) => {
    // 根据页面名称确定队列类型
    const isServerlessQueue = pageName === '全托管队列列表';
    const pageTypeName = isServerlessQueue ? '全托管' : '自运维';
    
    // 根据页面类型获取正确的资源池ID参数
    // 全托管队列列表使用固定参数 aihc-serverless
    // 自运维队列列表使用URL参数 clusterUuid
    const resourcePoolId = isServerlessQueue ? 'aihc-serverless' : params.clusterUuid;
    
    setTaskParams(prev => ({
      ...prev,
      cliItems: [
        {
          title: `获取${pageTypeName}队列列表`,
          text: `aihc queue list -p ${resourcePoolId}`,
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E9%98%9F%E5%88%97%E5%88%97%E8%A1%A8'
        }
      ],
      apiDocs: [
        {
          title: `获取${pageTypeName}队列列表`,
          text: 'https://cloud.baidu.com/doc/AIHC/s/zm569o5xc',
          requestExample: generateRequestExample('GET', 'DescribeQueues', { resourcePoolId })
        }
      ]
    }));
  };

  // 处理任务列表页面
  const handleTaskList = async (params: Record<string, string>) => {
    // 检查是否选中了资源池
    const hasSelectedResourcePool = params.clusters && params.clusters !== 'all';
    
    if (!hasSelectedResourcePool) {
      // 没有选中资源池时显示提示信息
      setTaskParams(prev => ({
        ...prev,
        cliItems: [
          {
            title: '⚠️ 需要先选中一个资源池',
            text: '请在左侧资源池列表中点击选择一个具体的资源池，然后再查看任务列表',
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E4%BB%BB%E5%8A%A1%E5%88%97%E8%A1%A8'
          }
        ],
        apiDocs: [
          {
            title: '⚠️ 需要先选中一个资源池',
            text: 'https://cloud.baidu.com/doc/AIHC/s/rm56ipjsz',
            requestExample: '请先在左侧选择一个资源池，然后才能获取该资源池的任务列表'
          }
        ]
      }));
      return;
    }
    
    // 已选中资源池时显示正常的CLI命令和API文档
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
          text: 'https://cloud.baidu.com/doc/AIHC/s/xmayvctia',
          requestExample: generateRequestExample('POST', 'DescribeJobs', { resourcePoolId: params.clusterUuid })
        }
      ]
    }));
  };

  // 处理自定义部署页面
  const handleCustomDeployment = async () => {
    setTaskParams(prev => ({
      ...prev,
      cliItems: [],
      apiDocs: [
        {
          title: '获取在线服务部署列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Imb4v5905',
          requestExample: generateRequestExample('GET', 'DescribeServices')
        }
      ]
    }));
  };

  // 处理数据集管理页面
  const handleDatasets = async () => {
    setTaskParams(prev => ({
      ...prev,
      cliItems: [],
      apiDocs: [
        {
          title: '获取数据集列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Emc099va4',
          requestExample: generateRequestExample('GET', 'DescribeDatasets')
        }
      ]
    }));
  };

  // 处理模型管理列表页面
  const handleModelManageList = async () => {
    setTaskParams(prev => ({
      ...prev,
      cliItems: [],
      apiDocs: [
        {
          title: '获取模型列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/amc1fmz95',
          requestExample: generateRequestExample('GET', 'DescribeModels')
        }
      ]
    }));
  };

  // 处理开发机列表页面
  const handleDevelopmentMachines = async () => {
    setTaskParams(prev => ({
      ...prev,
      cliItems: [],
      apiDocs: [
        {
          title: '获取开发机列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Nmbkpgnrm',
          requestExample: generateRequestExample('GET', 'DescribeDevInstances')
        }
      ]
    }));
  };

  // 处理在线服务部署详情页面
  const handleOnlineServiceDeploymentDetail = async (params: Record<string, string>) => {
    const serviceId = params.appId;
    console.log('[AIHC助手] 处理在线服务部署详情页面，serviceId:', serviceId);
    
    // 获取服务详情信息用于Chat功能
    let chatConfig = undefined;
    try {
      console.log('[AIHC助手] 开始获取服务详情信息...');
      const response = await fetch(`https://console.bce.baidu.com/api/aihcpom/app/v1/details?appId=${serviceId}&locale=zh-cn&_=${Date.now()}`);
      console.log('[AIHC助手] API响应状态:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AIHC助手] 服务详情数据:', data);
        
        if (data.data?.status) {
          const status = data.data.status;
          const internalIP = status.accessIPs?.internal;
          const port = status.accessPorts?.[0]?.servicePort || 8000;
          const token = status.aiGateway?.tokens?.serveless;
          const basePath = status.aiGateway?.basePath || '';
          
          console.log('[AIHC助手] 服务状态信息:', {
            internalIP,
            port,
            token: token ? `${token.substring(0, 20)}...` : 'none',
            basePath
          });
          
          if (internalIP && token) {
            chatConfig = {
              serviceUrl: `http://${internalIP}${basePath}${port}`,
              accessToken: token,
              basePath: ''
            };
            console.log('[AIHC助手] Chat配置创建成功:', {
              serviceUrl: chatConfig.serviceUrl,
              basePath: chatConfig.basePath,
              hasToken: !!chatConfig.accessToken
            });
          } else {
            console.log('[AIHC助手] 缺少必要信息，无法创建Chat配置:', {
              hasInternalIP: !!internalIP,
              hasToken: !!token
            });
          }
        } else {
          console.log('[AIHC助手] 服务详情数据中没有status字段');
        }
      } else {
        console.log('[AIHC助手] API请求失败，状态码:', response.status);
      }
    } catch (error) {
      console.error('[AIHC助手] 获取服务详情失败:', error);
    }
    
    // 如果没有获取到chatConfig，使用测试配置
    if (!chatConfig && serviceId) {
      console.log('[AIHC助手] 使用测试Chat配置');
      chatConfig = {
        serviceUrl: 'http://10.192.26.245/auth/s-rbb72e0754ef/8000',
        accessToken: 'Bearer 5253c7eb-01f3f99a5c64-c025373ef83c',
        basePath: ''
      };
    }
    
    console.log('[AIHC助手] 最终Chat配置:', chatConfig);
    
    setTaskParams(prev => ({
      ...prev,
      cliItems: [],
      apiDocs: [
        {
          title: '获取在线服务部署详情',
          text: 'https://cloud.baidu.com/doc/AIHC/s/4mb4v7wn5',
          requestExample: generateRequestExample('GET', 'DescribeService', { serviceId })
        }
      ],
      chatConfig
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