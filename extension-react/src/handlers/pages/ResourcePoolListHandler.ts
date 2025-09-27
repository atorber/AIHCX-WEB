import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 资源池列表页面处理器
 * 处理自运维和全托管资源池列表页面的数据
 */
export class ResourcePoolListHandler extends BaseHandler {
  async handle(pageName: string, _params: Record<string, string>): Promise<Partial<TaskParams>> {
    // 根据页面名称确定资源池类型
    const isServerlessResource = pageName === '全托管资源池列表';
    const pageTypeName = isServerlessResource ? '全托管' : '自运维';

    return {
      cliItems: [
        {
          title: `获取${pageTypeName}资源池列表`,
          text: isServerlessResource 
            ? 'aihc pool list --resourcePoolType dedicatedV2'
            : 'aihc pool list --resourcePoolType common',
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E8%B5%84%E6%BA%90%E6%B1%A0%E5%88%97%E8%A1%A8'
        }
      ],
      apiDocs: [
        {
          title: `获取${pageTypeName}资源池列表`,
          text: 'https://cloud.baidu.com/doc/AIHC/s/Km569l8xl',
          requestExample: this.generateRequestExample('GET', 'DescribeResourcePools', { 
            resourcePoolType: isServerlessResource ? 'dedicatedV2' : 'common' 
          })
        }
      ]
    };
  }
}
