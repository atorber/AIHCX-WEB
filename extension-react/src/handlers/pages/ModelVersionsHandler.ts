import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 模型版本列表页面处理器
 * 处理 /modelManage/info?tab=versions& 页面的数据
 */
export class ModelVersionsHandler extends BaseHandler {
  async handle(_pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    const modelId = params.modelId;

    return {
      cliItems: [],
      apiDocs: [
        {
          title: '获取模型版本列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Lmc1fr4lc',
          requestExample: this.generateRequestExample('GET', 'DescribeModelVersions', { 
            modelId,
            pageNumber: '1',
            pageSize: '10'
          })
        },
        {
          title: '获取模型版本信息',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Lmc1fr4lc',
          requestExample: this.generateRequestExample('GET', 'DescribeModelVersion', { 
            modelId,
            versionId: 'v1'
          })
        }
      ]
    };
  }
}
