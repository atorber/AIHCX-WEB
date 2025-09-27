import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 模型管理列表页面处理器
 * 处理 /modelManage/list 页面的数据
 */
export class ModelManageListHandler extends BaseHandler {
  async handle(_pageName: string, _params: Record<string, string>): Promise<Partial<TaskParams>> {
    return {
      cliItems: [],
      apiDocs: [
        {
          title: '获取模型列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/amc1fmz95',
          requestExample: this.generateRequestExample('GET', 'DescribeModels')
        }
      ]
    };
  }
}
