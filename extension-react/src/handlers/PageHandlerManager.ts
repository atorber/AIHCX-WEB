import { PageHandler, HandlerContext } from './types';

// 导入所有页面处理器
import {
  TaskDetailHandler,
  TaskListHandler,
  ResourcePoolListHandler,
  ResourcePoolDetailHandler,
  QueueListHandler,
  CustomDeploymentHandler,
  DatasetsHandler,
  DatasetDetailHandler,
  DatasetVersionsHandler,
  ModelManageListHandler,
  ModelDetailHandler,
  ModelVersionsHandler,
  DevelopmentMachinesHandler,
  OnlineServiceDeploymentDetailHandler,
  DataDownloadHandler
} from './pages';

export class PageHandlerManager {
  private handlers: Map<string, PageHandler> = new Map();
  private context: HandlerContext;

  constructor(context: HandlerContext) {
    this.context = context;
    this.initializeHandlers();
  }

  private initializeHandlers() {
    // 任务相关页面
    this.handlers.set('任务详情', new TaskDetailHandler(this.context));
    this.handlers.set('任务列表', new TaskListHandler(this.context));

    // 资源池相关页面
    this.handlers.set('自运维资源池列表', new ResourcePoolListHandler(this.context));
    this.handlers.set('全托管资源池列表', new ResourcePoolListHandler(this.context));
    this.handlers.set('自运维资源池详情', new ResourcePoolDetailHandler(this.context));
    this.handlers.set('全托管资源池详情', new ResourcePoolDetailHandler(this.context));

    // 队列相关页面
    this.handlers.set('队列列表', new QueueListHandler(this.context));
    this.handlers.set('全托管队列列表', new QueueListHandler(this.context));

    // 其他页面
    this.handlers.set('自定义部署', new CustomDeploymentHandler(this.context));
    this.handlers.set('数据集管理', new DatasetsHandler(this.context));
    this.handlers.set('数据集详情', new DatasetDetailHandler(this.context));
    this.handlers.set('数据集版本列表', new DatasetVersionsHandler(this.context));
    this.handlers.set('模型管理列表', new ModelManageListHandler(this.context));
    this.handlers.set('模型详情', new ModelDetailHandler(this.context));
    this.handlers.set('模型版本列表', new ModelVersionsHandler(this.context));
    this.handlers.set('开发机列表', new DevelopmentMachinesHandler(this.context));
    this.handlers.set('在线服务部署详情', new OnlineServiceDeploymentDetailHandler(this.context));
    this.handlers.set('数据下载', new DataDownloadHandler(this.context));
  }

  /**
   * 处理指定页面的数据
   */
  async handlePage(pageName: string, params: Record<string, string>) {
    const handler = this.handlers.get(pageName);
    if (!handler) {
      console.warn(`[PageHandlerManager] 未找到页面处理器: ${pageName}`);
      return {};
    }

    try {
      console.log(`[PageHandlerManager] 处理页面: ${pageName}`);
      const result = await handler.handle(pageName, params);
      console.log(`[PageHandlerManager] 页面处理完成: ${pageName}`, result);
      return result;
    } catch (error) {
      console.error(`[PageHandlerManager] 处理页面失败: ${pageName}`, error);
      return {};
    }
  }

  /**
   * 检查是否支持指定页面
   */
  isPageSupported(pageName: string): boolean {
    return this.handlers.has(pageName);
  }

  /**
   * 获取所有支持的页面名称
   */
  getSupportedPages(): string[] {
    return Array.from(this.handlers.keys());
  }
}
