import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 任务列表页面处理器
 * 处理任务列表页面的数据，包含资源池选择检查
 */
export class TaskListHandler extends BaseHandler {
  async handle(_pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    // 检查是否选中了资源池
    const hasSelectedResourcePool = params.clusters && params.clusters !== 'all';
    
    if (!hasSelectedResourcePool) {
      return {
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
      };
    }

    return {
      cliItems: [
        {
          title: '获取任务列表',
          text: `aihc job list -p ${params.clusterUuid}`,
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E4%BB%BB%E5%8A%A1%E5%88%97%E8%A1%A8'
        }
      ],
      apiDocs: [
        {
          title: '获取任务列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/xmayvctia',
          requestExample: this.generateRequestExample('POST', 'DescribeJobs', { resourcePoolId: params.clusterUuid })
        }
      ]
    };
  }
}
