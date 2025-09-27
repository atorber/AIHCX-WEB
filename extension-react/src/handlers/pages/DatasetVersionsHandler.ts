import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 数据集版本列表页面处理器
 * 处理 /dataset/info?tab=versions& 页面的数据
 */
export class DatasetVersionsHandler extends BaseHandler {
  async handle(_pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    const datasetId = params.datasetId;

    return {
      cliItems: [],
      apiDocs: [
        {
          title: '获取数据集版本列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Tmc09d4k0',
          requestExample: this.generateRequestExample('GET', 'DescribeDatasetVersions', { 
            datasetId,
            pageNumber: '1',
            pageSize: '10'
          })
        },
        {
          title: '获取数据集版本信息',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Tmc09d4k0',
          requestExample: this.generateRequestExample('GET', 'DescribeDatasetVersion', { 
            datasetId,
            versionId: 'v1'
          })
        }
      ]
    };
  }
}
