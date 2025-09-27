import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 队列列表页面处理器
 * 处理自运维和全托管队列列表页面的数据
 */
export class QueueListHandler extends BaseHandler {
  async handle(pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    // 根据页面名称确定队列类型
    const isServerlessQueue = pageName === '全托管队列列表';
    const pageTypeName = isServerlessQueue ? '全托管' : '自运维';
    
    // 根据队列类型选择正确的resourcePoolId
    const resourcePoolId = isServerlessQueue ? 'aihc-serverless' : params.clusterUuid;

    return {
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
          requestExample: this.generateRequestExample('GET', 'DescribeQueues', { resourcePoolId })
        }
      ]
    };
  }
}
