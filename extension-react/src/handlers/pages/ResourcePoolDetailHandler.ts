import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 资源池详情页面处理器
 * 处理自运维和全托管资源池详情页面的数据
 */
export class ResourcePoolDetailHandler extends BaseHandler {
  async handle(pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    // 根据传入的页面名称确定资源池类型
    const isServerlessResource = pageName === '全托管资源池详情';
    const pageTypeName = isServerlessResource ? '全托管' : '自运维';
    
    // 根据资源池类型选择正确的参数
    const resourcePoolId = isServerlessResource ? params.resourcePoolId : params.clusterUuid;

    return {
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
          requestExample: this.generateRequestExample('GET', 'DescribeResourcePool', { 
            resourcePoolId, 
            resourcePoolType: isServerlessResource ? 'dedicatedV2' : 'common' 
          })
        }
      ]
    };
  }
}
