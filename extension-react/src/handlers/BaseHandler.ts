import { PageHandler, HandlerContext } from './types';
import { TaskParams } from '../types';

export abstract class BaseHandler implements PageHandler {
  protected context: HandlerContext;

  constructor(context: HandlerContext) {
    this.context = context;
  }

  abstract handle(pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>>;

  /**
   * 生成请求示例的通用方法
   */
  protected generateRequestExample(
    method: 'GET' | 'POST', 
    action: string, 
    params?: { resourcePoolId?: string; resourcePoolType?: string; serviceId?: string; datasetId?: string; modelId?: string; pageNumber?: string; pageSize?: string; versionId?: string }
  ): string {
    return this.context.generateRequestExample(method, action, params);
  }

  /**
   * 创建空的TaskParams更新对象
   */
  protected createEmptyUpdate(): Partial<TaskParams> {
    return {
      cliItems: [],
      apiDocs: [],
      jsonItems: [],
      yamlItems: [],
      commandScript: '',
      chatConfig: undefined
    };
  }
}
