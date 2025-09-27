import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 任务详情页面处理器
 * 处理任务详情页面的数据，包含CLI命令和API文档
 */
export class TaskDetailHandler extends BaseHandler {
  async handle(_pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    return {
      cliItems: [
        {
          title: '获取任务详情',
          text: `aihc job get ${params.jobId} -p ${params.clusterUuid}`,
          doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E4%BB%BB%E5%8A%A1%E8%AF%A6%E6%83%85'
        }
      ],
      apiDocs: [
        {
          title: '获取任务详情',
          text: 'https://cloud.baidu.com/doc/AIHC/s/xmayvctia',
          requestExample: this.generateRequestExample('POST', 'DescribeJob', { resourcePoolId: params.clusterUuid })
        },
        {
          title: '创建任务',
          text: 'https://cloud.baidu.com/doc/AIHC/s/jm56inxn7',
          requestExample: this.generateRequestExample('POST', 'CreateJob', { resourcePoolId: params.clusterUuid })
        }
      ]
    };
  }
}
