import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 在线服务部署详情页面处理器
 * 处理 /deployment/custom? 页面的数据，包含Chat功能
 */
export class OnlineServiceDeploymentDetailHandler extends BaseHandler {
  async handle(_pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    const serviceId = params.appId;
    
    // 获取服务详情信息用于Chat功能
    let chatConfig = undefined;
    let chatError = null;
    
    try {
      console.log('[AIHC助手] 开始获取服务详情信息...');
      
      // 添加超时控制，避免长时间等待
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch(`https://console.bce.baidu.com/api/aihcpom/app/v1/details?appId=${serviceId}&locale=zh-cn&_=${Date.now()}`, {
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

    return {
      cliItems: [],
      apiDocs: [
        {
          title: '获取在线服务部署详情',
          text: 'https://cloud.baidu.com/doc/AIHC/s/4mb4v7wn5',
          requestExample: this.generateRequestExample('GET', 'DescribeService', { serviceId })
        }
      ],
      chatConfig
    };
  }
}
