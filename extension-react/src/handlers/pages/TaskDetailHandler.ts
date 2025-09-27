import { BaseHandler } from '../BaseHandler';
import { TaskParams } from '../../types';

/**
 * 任务详情页面处理器
 * 处理任务详情页面的数据，包含CLI命令和API文档
 */
export class TaskDetailHandler extends BaseHandler {
  async handle(_pageName: string, params: Record<string, string>): Promise<Partial<TaskParams>> {
    console.log('[AIHC助手] 处理任务详情页面');
    console.log('[AIHC助手] URL参数:', params);
    
    // 检查必要参数
    const clusterUuid = params.clusterUuid;
    const k8sName = params.k8sName;
    const kind = params.kind;
    const k8sNamespace = params.k8sNamespace;
    const queueID = params.queueID;
    
    if (!clusterUuid || !k8sName) {
      console.error('[AIHC助手] 缺少必要参数');
      return {
        cliItems: [],
        apiDocs: [
          {
            title: '获取任务详情',
            text: 'https://cloud.baidu.com/doc/AIHC/s/xmayvctia',
            requestExample: this.generateRequestExample('POST', 'DescribeJob', { resourcePoolId: clusterUuid })
          }
        ],
        jsonItems: [],
        yamlItems: [],
        commandScript: ''
      };
    }

    try {
      // 调用API获取任务详情
      const apiUrl = `https://console.bce.baidu.com/api/cce/ai-service/v1/cluster/${clusterUuid}/aijob/${k8sName}?kind=${kind}&namespace=${k8sNamespace}&queueID=${queueID}&locale=zh-cn&_=${Date.now()}`;
      console.log('[AIHC助手] 请求任务详情API:', apiUrl);
      
      // 添加超时控制，防止API调用无限等待
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('[AIHC助手] API响应状态:', response.status, response.ok);
      
      const data = await response.json();
      console.log('[AIHC助手] API响应数据:', data);

      if (!data.result || !data.result.rawRequest) {
        throw new Error('API响应中缺少必要的数据字段');
      }

      // 解析任务信息
      let taskInfo;
      let requestParams: any = {};
      
      try {
        taskInfo = JSON.parse(data.result.rawRequest);
        console.log('[AIHC助手] 解析后的任务信息:', taskInfo);
        requestParams = this.formatRequestParams(taskInfo);
      } catch (e) {
        console.error('[AIHC助手] JSON解析错误:', e);
        throw new Error('解析任务信息失败: ' + (e instanceof Error ? e.message : String(e)));
      }

      // 生成CLI命令和参数
      const cliCommand = this.generateCLICommand(requestParams);
      const yamlContent = this.generateYAML(requestParams);

      return {
        cliItems: [
          {
            title: '获取任务详情',
            text: `aihc job get ${k8sName} -p ${clusterUuid}`,
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E4%BB%BB%E5%8A%A1%E8%AF%A6%E6%83%85'
          },
          {
            title: '创建任务',
            text: cliCommand,
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E7%9B%B4%E6%8E%A5%E4%BC%A0%E5%8F%82%E6%96%B9%E5%BC%8F%E5%88%9B%E5%BB%BA%E4%BB%BB%E5%8A%A1'
          }
        ],
        apiDocs: [
          {
            title: '获取任务详情',
            text: 'https://cloud.baidu.com/doc/AIHC/s/xmayvctia',
            requestExample: this.generateRequestExample('POST', 'DescribeJob', { resourcePoolId: clusterUuid })
          },
          {
            title: '创建任务',
            text: 'https://cloud.baidu.com/doc/AIHC/s/jm56inxn7',
            requestExample: this.generateRequestExample('POST', 'CreateJob', { resourcePoolId: clusterUuid })
          }
        ],
        jsonItems: [
          {
            title: '创建任务Body参数',
            text: JSON.stringify(requestParams, null, 2)
          }
        ],
        yamlItems: [
          {
            title: '创建任务Body参数',
            text: yamlContent
          }
        ],
        commandScript: requestParams.jobSpec?.command || ''
      };

    } catch (error) {
      console.error('[AIHC助手] 加载任务详情失败:', error);
      
      // 返回基础内容
      return {
        cliItems: [
          {
            title: '获取任务详情',
            text: `aihc job get ${k8sName || 'TASK_NAME'} -p ${clusterUuid || 'POOL_ID'}`,
            doc: 'https://cloud.baidu.com/doc/AIHC/s/Tm7x702fo#%E8%8E%B7%E5%8F%96%E4%BB%BB%E5%8A%A1%E8%AF%A6%E6%83%85'
          }
        ],
        apiDocs: [
          {
            title: '获取任务详情',
            text: 'https://cloud.baidu.com/doc/AIHC/s/xmayvctia',
            requestExample: this.generateRequestExample('POST', 'DescribeJob', { resourcePoolId: clusterUuid })
          },
          {
            title: '创建任务',
            text: 'https://cloud.baidu.com/doc/AIHC/s/jm56inxn7',
            requestExample: this.generateRequestExample('POST', 'CreateJob', { resourcePoolId: clusterUuid })
          }
        ],
        jsonItems: [],
        yamlItems: [],
        commandScript: ''
      };
    }
  }

  // 格式化请求参数
  private formatRequestParams(params: any): any {
    if (!params || typeof params !== 'object') {
      return {};
    }

    const jobSpec = {
      "image": params.jobSpec?.Master?.image || "registry.baidubce.com/cce-ai-native/cy-pytorch-mnist",
      "imageConfig": {
        "username": "",
        "password": ""
      },
      "replicas": params.jobSpec?.Master?.replicas || 1,
      "resources": params.jobSpec?.Master?.resource ? [
        {
          "name": "cpu",
          "quantity": params.jobSpec.Master.resource.cpu || 1
        }
      ] : [
        {
          "name": "cpu",
          "quantity": 1
        }
      ],
      "command": params.command || "#! /bin/bash",
      "envs": params.jobSpec?.Master?.env ? Object.entries(params.jobSpec.Master.env).map(([name, value]) => ({
        "name": name,
        "value": value
      })) : [],
      "volumes": params.datasource ? params.datasource.map((ds: any) => ({
        "name": ds.name,
        "mountPath": ds.mountPath,
        "type": ds.type
      })) : [],
      "enableRDMA": params.enableBccl || false
    };

    return {
      "name": params.name || "task-name",
      "jobFramework": params.jobFramework || "pytorch",
      "jobSpec": jobSpec,
      "queue": params.queue || "default",
      "priority": params.priority || "normal",
      "faultTolerance": params.faultTolerance || false,
      "oversell": params.oversell || false
    };
  }

  // 生成CLI命令
  private generateCLICommand(taskInfo: any): string {
    let cliCommand = `aihc job create --name ${taskInfo.name} \\
    --framework ${taskInfo.jobFramework} \\
    --image ${taskInfo.jobSpec.image} \\`;

    // 添加队列参数（如果有）
    if (taskInfo.queue && taskInfo.queue !== 'default') {
      cliCommand += `\n    --pool ${taskInfo.queue} \\`;
    }

    // 添加RDMA参数
    cliCommand += `\n    --enable-rdma=${taskInfo.jobSpec.enableRDMA || false} \\`;

    // 添加GPU资源（如果有）
    if (taskInfo.jobSpec.resources) {
      taskInfo.jobSpec.resources.forEach((item: { name: string, quantity: number }) => {
        cliCommand += `\n    --gpu ${item.name}=${item.quantity} \\`;
      });
    }

    // 添加BCCL参数
    cliCommand += `\n    --enable-bccl=${taskInfo.enableBccl || false} \\`;

    // 添加容错参数
    cliCommand += `\n    --enable-fault-tolerance=${taskInfo.faultTolerance || false} \\`;

    // 添加优先级
    cliCommand += `\n    --priority ${taskInfo.priority || 'normal'} \\`;

    // 添加副本数
    cliCommand += `\n    --replicas ${taskInfo.jobSpec.replicas || 1} \\`;

    // 添加环境变量
    if (taskInfo.jobSpec.envs && taskInfo.jobSpec.envs.length > 0) {
      taskInfo.jobSpec.envs.forEach((env: { name: string, value: string }) => {
        cliCommand += `\n    --env ${env.name}=${env.value} \\`;
      });
    }

    // 添加命令
    cliCommand += `\n    --command "${taskInfo.jobSpec.command || '#! /bin/bash'}"`;

    return cliCommand;
  }

  // 生成YAML
  private generateYAML(taskInfo: any): string {
    let yaml = `name: ${taskInfo.name}
jobFramework: ${taskInfo.jobFramework}
queue: ${taskInfo.queue || 'default'}
priority: ${taskInfo.priority || 'normal'}
faultTolerance: ${taskInfo.faultTolerance || false}
jobSpec:
  image: ${taskInfo.jobSpec.image}
  replicas: ${taskInfo.jobSpec.replicas || 1}
  command: "${taskInfo.jobSpec.command || '#! /bin/bash'}"
  enableRDMA: ${taskInfo.jobSpec.enableRDMA || false}
  resources:`;

    if (taskInfo.jobSpec.resources && taskInfo.jobSpec.resources.length > 0) {
      taskInfo.jobSpec.resources.forEach((resource: { name: string, quantity: number }) => {
        yaml += `\n    - name: ${resource.name}\n      quantity: ${resource.quantity}`;
      });
    } else {
      yaml += `\n    - name: cpu\n      quantity: 1`;
    }

    if (taskInfo.jobSpec.envs && taskInfo.jobSpec.envs.length > 0) {
      yaml += `\n  envs:`;
      taskInfo.jobSpec.envs.forEach((env: { name: string, value: string }) => {
        yaml += `\n    - name: ${env.name}\n      value: ${env.value}`;
      });
    }

    return yaml;
  }
}
