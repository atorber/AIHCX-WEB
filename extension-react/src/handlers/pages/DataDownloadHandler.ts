import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 数据下载页面处理器
 * 处理 /dataDownload/create 页面的数据，支持HuggingFace数据集地址自动填充
 */
export class DataDownloadHandler extends BaseHandler {
  async handle(_pageName: string, _params: Record<string, string>): Promise<Partial<TaskParams>> {
    return {
      // 不显示任何Tab，只显示输入框
      cliItems: [],
      apiDocs: [],
      jsonItems: [],
      yamlItems: [],
      commandScript: '',
      // 标记为数据下载页面，需要特殊处理
      isDataDownloadPage: true
    };
  }
}
