import { TaskParams } from '../types';

export interface PageHandler {
  /**
   * 处理页面数据
   * @param pageName 页面名称
   * @param params URL参数
   * @returns 更新后的TaskParams
   */
  handle(pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>>;
}

export interface HandlerContext {
  generateRequestExample: (
    method: 'GET' | 'POST', 
    action: string, 
    params?: { resourcePoolId?: string; resourcePoolType?: string; serviceId?: string; datasetId?: string; modelId?: string; pageNumber?: string; pageSize?: string; versionId?: string }
  ) => string;
}
