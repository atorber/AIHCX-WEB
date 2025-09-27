import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 数据集管理页面处理器
 * 处理 /datasets 页面的数据
 */
export class DatasetsHandler extends BaseHandler {
  async handle(_pageName: string, _params: Record<string, string>): Promise<Partial<TaskParams>> {
    return {
      cliItems: [],
      apiDocs: [
        {
          title: '获取数据集列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Emc099va4',
          requestExample: this.generateRequestExample('GET', 'DescribeDatasets')
        }
      ]
    };
  }
}
