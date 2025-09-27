import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 模型详情页面处理器
 * 处理 /modelManage/info? 页面的数据
 */
export class ModelDetailHandler extends BaseHandler {
  async handle(_pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    const modelId = params.modelId;

    return {
      cliItems: [],
      apiDocs: [
        {
          title: '获取模型详情',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Xmc1flhmc',
          requestExample: this.generateRequestExample('GET', 'DescribeModel', { modelId })
        }
      ]
    };
  }
}
