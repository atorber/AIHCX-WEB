import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 自定义部署页面处理器
 * 处理 /deployments/custom 页面的数据
 */
export class CustomDeploymentHandler extends BaseHandler {
  async handle(_pageName: string, _params: Record<string, string>): Promise<Partial<TaskParams>> {
    return {
      cliItems: [],
      apiDocs: [
        {
          title: '获取在线服务部署列表',
          text: 'https://cloud.baidu.com/doc/AIHC/s/Imb4v5905',
          requestExample: this.generateRequestExample('GET', 'DescribeServices')
        }
      ]
    };
  }
}
