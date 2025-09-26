import { BceBaseClient } from '@atorber/baiducloud-sdk';
/**
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * @file src/aihc_client.ts
 * @author atorber
 */

import * as u from 'underscore';
import debugLib from 'debug';
import type { BceConfig, BceResponse } from './types/common';

const debug = debugLib('bce-sdk:AihcClient');

// ==================== 类型定义 ====================

/** 资源池配置 */
interface ResourcePool {
  id: string;
  name: string;
  description?: string;
  status: string;
  createTime: string;
}

/** 队列配置 */
interface Queue {
  name: string;
  description?: string;
  deserved: {
    cpu: number;
    memory: number;
  };
  parentQueue: string;
  queueType: 'Regular' | 'Preemptible';
  disableOversell?: boolean;
}

/** AI 任务配置 */
interface AIJob {
  jobId?: string;
  name: string;
  description?: string;
  queue: string;
  framework: string;
  image: string;
  command: string[];
  workingDir?: string;
  env?: Record<string, string>;
  resources: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
}

/** 客户端选项 */
interface AihcClientOptions {
  maxKeys?: number;
  marker?: string;
  config?: Partial<BceConfig>;
}

/**
 * AIHC service API client
 *
 * @see https://cloud.baidu.com/doc/AIHC/s/dly5i8vfs
 */
export default class AihcClient extends BceBaseClient {
  /**
   * 构造函数
   * @param config AIHC 客户端配置
   */
  constructor(config: BceConfig) {
    super(config, 'aihc', true);
  }

  // --- 资源池管理 ---

  /**
   * 获取资源池列表
   * 
   * @param options 选项
   * @returns Promise 解析为资源池列表
   */
  public async listResourcepools(options?: AihcClientOptions): Promise<any> {
    const opts = options || {};
    const params = u.extend({ maxKeys: 1000 }, u.pick(opts, 'maxKeys', 'marker'));

    return this.sendRequest('GET', '/api/v1/resourcepools', {
      params: params,
      config: opts.config
    });
  }

  /**
   * 获取资源池详情
   * 
   * @param resourcePoolId 资源池ID
   * @param options 选项
   * @returns Promise 解析为资源池详情
   */
  public async getResourcepool(resourcePoolId: string, options?: AihcClientOptions): Promise<any> {
    const opts = options || {};

    return this.sendRequest('GET', `/api/v1/resourcepools/${resourcePoolId}`, {
      config: opts.config
    });
  }

  /**
   * 获取资源池节点列表
   * 
   * @param resourcePoolId 资源池ID
   * @param options 选项
   * @returns Promise 解析为节点列表
   */
  public async listResourcepoolNodes(resourcePoolId: string, options?: AihcClientOptions): Promise<any> {
    const opts = options || {};
    const params = u.extend({ maxKeys: 1000 }, u.pick(opts, 'maxKeys', 'marker'));

    return this.sendRequest('GET', `/api/v1/resourcepools/${resourcePoolId}/nodes`, {
      params: params,
      config: opts.config
    });
  }

  // --- 队列管理 ---

  /**
   * 获取队列列表
   * 
   * @param resourcePoolId 资源池ID
   * @param options 选项
   * @returns Promise 解析为队列列表
   */
  public async listResourcepoolQueues(resourcePoolId: string, options?: AihcClientOptions): Promise<any> {
    const opts = options || {};
    const params = u.extend({ maxKeys: 1000 }, u.pick(opts, 'maxKeys', 'marker'));

    return this.sendRequest('GET', `/api/v1/resourcepools/${resourcePoolId}/queue`, {
      params: params,
      config: opts.config
    });
  }

  /**
   * 获取队列详情
   * 
   * @param resourcePoolId 资源池ID
   * @param queueName 队列名称
   * @param options 选项
   * @returns Promise 解析为队列详情
   */
  public async getResourcepoolQueue(resourcePoolId: string, queueName: string, options?: AihcClientOptions): Promise<any> {
    const opts = options || {};

    return this.sendRequest('GET', `/api/v1/resourcepools/${resourcePoolId}/queue/${queueName}`, {
      config: opts.config
    });
  }

  /**
   * 删除队列
   * 
   * @param resourcePoolId 资源池ID
   * @param queueName 队列名称
   * @param options 选项
   * @returns Promise 解析为删除结果
   */
  public async deleteResourcepoolQueue(resourcePoolId: string, queueName: string, options?: AihcClientOptions): Promise<any> {
    const opts = options || {};

    return this.sendRequest('DELETE', `/api/v1/resourcepools/${resourcePoolId}/queue/${queueName}`, {
      config: opts.config
    });
  }

  /**
   * 创建队列
   * 
   * @param resourcePoolId 资源池ID
   * @param queueConfig 队列配置
   * @param options 选项
   * @returns Promise 解析为创建结果
   */
  public async createResourcepoolQueue(resourcePoolId: string, queueConfig: Queue, options?: AihcClientOptions): Promise<any> {
    const clientToken = await this.getClientToken();
    const opts = options || {};

    debug('createResourcepoolQueue, queueConfig = %j', queueConfig);

    return this.sendRequest('POST', `/api/v1/resourcepools/${resourcePoolId}/queue`, {
      config: opts.config,
      body: JSON.stringify(queueConfig)
    });
  }

  /**
   * 更新队列
   * 
   * @param resourcePoolId 资源池ID
   * @param queueName 队列名称
   * @param queueConfig 队列配置
   * @param options 选项
   * @returns Promise 解析为更新结果
   */
  public async updateResourcepoolQueue(
    resourcePoolId: string,
    queueName: string,
    queueConfig: Partial<Queue>,
    options?: AihcClientOptions
  ): Promise<any> {
    const opts = options || {};

    return this.sendRequest('PUT', `/api/v1/resourcepools/${resourcePoolId}/queue/${queueName}`, {
      config: opts.config,
      body: JSON.stringify(queueConfig)
    });
  }

  // --- AI 任务管理 ---

  /**
   * 创建 AI 训练任务
   * 
   * @param resourcePoolId 资源池ID
   * @param jobConfig 任务配置
   * @param options 选项
   * @returns Promise 解析为创建结果
   */
  public async createAIJob(resourcePoolId: string, jobConfig: AIJob, options?: AihcClientOptions): Promise<any> {
    const opts = options || {};

    const params = {
      resourcePoolId: resourcePoolId
    };

    debug('createAIJob, params = %j, jobConfig = %j', params, jobConfig);

    return this.sendRequest('POST', '/api/v1/aijobs', {
      config: opts.config,
      params: params,
      body: JSON.stringify(jobConfig)
    });
  }

  /**
   * 获取 AI 训练任务列表
   * 
   * @param resourcePoolId 资源池ID
   * @param options 选项
   * @returns Promise 解析为任务列表
   */
  public async listAIJobs(resourcePoolId: string, options?: AihcClientOptions): Promise<any> {
    const opts = options || {};
    const params = {
      resourcePoolId: resourcePoolId,
    };
    
    debug('listAIJobs, params = %j', params);
    debug('listAIJobs, config = %j', opts.config);
    
    return this.sendRequest('GET', '/api/v1/aijobs', {
      params,
      config: opts.config
    });
  }

  /**
   * 获取 AI 训练任务详情
   * 
   * @param resourcePoolId 资源池ID
   * @param jobId 任务ID
   * @param options 选项
   * @returns Promise 解析为任务详情
   */
  public async getAIJob(resourcePoolId: string, jobId: string, options?: AihcClientOptions): Promise<any> {
    const opts = options || {};
    const params = {
      resourcePoolId: resourcePoolId,
    };
    
    debug('getAIJob, params = %j', params);
    debug('getAIJob, config = %j', opts.config);
    
    return this.sendRequest('GET', `/api/v1/aijobs/${jobId}`, {
      params,
      config: opts.config
    });
  }

  // --- 辅助方法 ---

  /**
   * 获取客户端令牌
   * @returns Promise 解析为令牌
   */
  private async getClientToken(): Promise<any> {
    return this.sendRequest('POST', '/api/v1/token', {});
  }
}