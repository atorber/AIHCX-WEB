import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 数据集详情页面处理器
 * 处理 /dataset/info? 页面的数据
 */
export class DatasetDetailHandler extends BaseHandler {
  async handle(_pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    const datasetId = params.datasetId;

    return {
      cliItems: [],
      apiDocs: [
        {
          title: '获取数据集详情',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Dmc09bpj1',
          requestExample: this.generateRequestExample('GET', 'DescribeDataset', { datasetId })
        }
      ]
    };
  }
}
