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
    
     // 返回包含Chat功能的完整内容
     const basicResult = {
       cliItems: [],
       apiDocs: [
         {
           title: '获取在线服务部署详情',
           text: 'https://cloud.baidu.com/doc/AIHC/s/4mb4v7wn5',
           requestExample: this.generateRequestExample('GET', 'DescribeService', { serviceId })
         }
       ],
       // 提供Chat配置，初始状态为未加载
       chatConfig: {
         serviceUrl: '',
         accessToken: '',
         basePath: '',
         serviceId: serviceId, // 保存serviceId用于后续加载
         isLoaded: false // 标记配置是否已加载
       },
       chatLoading: false,
       chatError: undefined
     };
    
    // 如果没有serviceId，直接返回基础内容
    if (!serviceId) {
      console.log('[AIHC助手] 缺少serviceId参数，返回基础内容');
      return basicResult;
    }
    
     // 暂时移除Chat功能，直接返回基础内容
    
    return basicResult;
  }
}
