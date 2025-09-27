import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 在线服务部署详情页面处理器
 * 处理 /deployment/custom? 页面的数据，包含Chat功能
 */
export class OnlineServiceDeploymentDetailHandler extends BaseHandler {
  async handle(_pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    const serviceId = params.appId;
    
    // 立即返回基础内容，不等待API请求
    console.log('[AIHC助手] 处理在线服务部署详情页面');
    console.log('[AIHC助手] URL参数:', params);
    console.log('[AIHC助手] 提取的serviceId (appId):', serviceId);
    
     // 先返回基础的API文档内容，暂时不包含Chat功能
     const basicResult = {
       cliItems: [],
       apiDocs: [
         {
           title: '获取在线服务部署详情',
           text: 'https://cloud.baidu.com/doc/AIHC/s/4mb4v7wn5',
           requestExample: this.generateRequestExample('GET', 'DescribeService', { serviceId })
         }
       ]
       // 暂时移除Chat配置
     };
    
    // 如果没有serviceId，直接返回基础内容
    if (!serviceId) {
      console.log('[AIHC助手] 缺少serviceId参数，返回基础内容');
      return basicResult;
    }
    
    // 异步获取服务详情信息用于Chat功能，但不阻塞主流程
    this.loadChatConfigAsync(serviceId).then(chatConfig => {
      console.log('[AIHC助手] Chat配置异步加载完成:', chatConfig);
      // 这里可以通过事件或消息通知UI更新Chat配置
    }).catch(error => {
      console.error('[AIHC助手] Chat配置异步加载失败:', error);
    });
    
    return basicResult;
  }
  
  private async loadChatConfigAsync(serviceId: string) {
    // 获取服务详情信息用于Chat功能
    let chatConfig = undefined;
    let chatError = null;
    
    try {
      console.log('[AIHC助手] 开始异步获取服务详情信息...');
      console.log('[AIHC助手] 使用serviceId:', serviceId);
      
      // 添加超时控制，避免长时间等待
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const apiUrl = `https://console.bce.baidu.com/api/aihcpom/app/v1/details?appId=${serviceId}&locale=zh-cn&_=${Date.now()}`;
      console.log('[AIHC助手] API请求URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
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
            chatError = '服务状态信息不完整，缺少必要的访问信息';
            console.log('[AIHC助手] 缺少必要信息，无法创建Chat配置:', {
              hasInternalIP: !!internalIP,
              hasToken: !!token
            });
          }
        } else {
          chatError = '服务详情数据中没有状态信息';
          console.log('[AIHC助手] 服务详情数据中没有status字段');
        }
      } else {
        chatError = `API请求失败，状态码: ${response.status}`;
        console.log('[AIHC助手] API请求失败，状态码:', response.status);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          chatError = '请求超时，请稍后重试';
          console.error('[AIHC助手] 请求超时:', error);
        } else {
          chatError = `获取服务详情失败: ${error.message}`;
          console.error('[AIHC助手] 获取服务详情失败:', error);
        }
      } else {
        chatError = '获取服务详情失败: 未知错误';
        console.error('[AIHC助手] 获取服务详情失败:', error);
      }
    }
    
    // 只有在成功获取到配置时才设置chatConfig，避免使用测试配置
    if (!chatConfig) {
      console.log('[AIHC助手] 无法创建Chat配置:', chatError);
    }
    
    console.log('[AIHC助手] 最终Chat配置:', chatConfig);
    return chatConfig;
  }
}
