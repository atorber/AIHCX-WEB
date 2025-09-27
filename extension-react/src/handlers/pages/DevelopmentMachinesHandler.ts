import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 开发机列表页面处理器
 * 处理 /developmentMachines 页面的数据
 */
export class DevelopmentMachinesHandler extends BaseHandler {
  async handle(_pageName: string, _params: Record<string, string>): Promise<Partial<TaskParams>> {
    return {
      cliItems: [],
      apiDocs: [
        {
          title: '获取开发机列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Nmbkpgnrm',
          requestExample: this.generateRequestExample('GET', 'DescribeDevInstances')
        }
      ]
    };
  }
}
